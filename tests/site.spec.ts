import { test, expect } from "@playwright/test";
import { mkdir, readFile, unlink } from "node:fs/promises";
import path from "node:path";

test("public pages render locally at desktop and mobile sizes", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const externalRequests: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => {
    if (!new URL(request.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/))
      externalRequests.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await mkdir("test-results/screenshots", { recursive: true });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "/",
      "/projects",
      "/about",
      "/contact",
      "/projects/chromatic-fields",
      "/studio",
    ]) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      const broken = await page.locator("img").evaluateAll((images) =>
        images
          .filter(
            (image): image is HTMLImageElement =>
              image instanceof HTMLImageElement,
          )
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.src),
      );
      expect(broken).toEqual([]);
      if (
        (width === 1440 || width === 390) &&
        ["/", "/projects", "/about", "/studio"].includes(route)
      )
        await page.screenshot({
          path: `test-results/screenshots/${route.replaceAll("/", "") || "home"}-${width}.png`,
          fullPage: true,
          animations: "disabled",
        });
    }
  }
  expect(externalRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test("filters, navigation, SVG control, video and reduced motion", async ({
  page,
}) => {
  await page.goto("/projects");
  await expect(page.locator(".project-item")).toHaveCount(4);
  await page.getByRole("button", { name: /^Sound/ }).click();
  await expect(page.locator(".project-item")).toHaveCount(1);
  await expect(page.locator(".project-item h3")).toHaveText("Signal / Noise");
  await page.getByRole("button", { name: /^All/ }).click();
  await expect(page.locator(".project-item")).toHaveCount(4);
  await page.setViewportSize({ width: 390, height: 900 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "About" })
    .click();
  await expect(page).toHaveURL(/\/about$/);
  await page.goto("/");
  await page.locator(".hero-scene").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator(".hero-video")
        .evaluate((video: HTMLVideoElement) => video.readyState),
    )
    .toBeGreaterThan(1);
  await expect
    .poll(() =>
      page
        .locator(".hero-video")
        .evaluate((video: HTMLVideoElement) => video.paused),
    )
    .toBe(false);
  await page.getByRole("button", { name: "Pause motion" }).click();
  expect(
    await page
      .locator(".hero-video")
      .evaluate((video: HTMLVideoElement) => video.paused),
  ).toBe(true);
  await page.getByRole("button", { name: "Change artwork colour" }).click();
  await expect(page.locator(".hero-scene")).toHaveCSS(
    "filter",
    "hue-rotate(50deg)",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.getByRole("button", { name: "Play motion" })).toBeVisible();
  expect(
    await page
      .locator(".hero-video")
      .evaluate((video: HTMLVideoElement) => video.paused),
  ).toBe(true);
});

test("local editor creates drafts, previews, uploads, publishes and deletes", async ({
  page,
  request,
}) => {
  const title = `Browser check ${Date.now()}`;
  let uploaded: string | undefined;
  let id: string | undefined;
  try {
    await page.goto("/studio");
    await page
      .getByRole("button", { name: "New project", exact: true })
      .click();
    await page.getByLabel("Title", { exact: true }).fill(title);
    const slug = await page.getByLabel("URL slug").inputValue();
    await page.getByLabel("Client", { exact: true }).fill("Local test");
    await page
      .getByRole("textbox", { name: "Description", exact: true })
      .fill("Created locally to verify the complete editing workflow.");
    await page
      .getByLabel("Image description")
      .fill("A locally generated abstract image");
    await page
      .getByLabel("Upload cover image")
      .setInputFiles("public/media/soft.jpg");
    await expect(page.getByRole("status")).toContainText("Uploaded.");
    uploaded =
      (await page.locator(".media-editor > img").getAttribute("src")) ??
      undefined;
    await page.getByRole("button", { name: "Preview", exact: true }).click();
    await expect(
      page.getByRole("region", { name: "Project preview" }),
    ).toContainText(title);
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Draft saved.");
    const saved = JSON.parse(await readFile("data/projects.json", "utf8"));
    id = saved.find(
      (project: { title: string }) => project.title === title,
    )?.id;
    expect(id).toBeTruthy();
    expect((await request.get(`/projects/${slug}`)).status()).toBe(404);
    await page.getByLabel("Visibility").selectOption("published");
    await page
      .getByRole("button", { name: "Save & publish", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("Project published.");
    expect((await request.get(`/projects/${slug}`)).status()).toBe(200);
    await page.reload();
    await page.getByRole("button", { name: new RegExp(title) }).click();
    await expect(page.getByRole("textbox", { name: "Description", exact: true })).toHaveValue(
      "Created locally to verify the complete editing workflow.",
    );
    await page
      .getByRole("button", { name: "Delete project", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Delete permanently", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("Project deleted.");
    expect((await request.get(`/projects/${slug}`)).status()).toBe(404);
  } finally {
    if (id)
      await request.post("/api/projects", {
        headers: { origin: "http://127.0.0.1:3100" },
        data: { action: "delete", id },
      });
    if (uploaded?.startsWith("/media/"))
      await unlink(path.join("public", uploaded)).catch(() => undefined);
  }
});

test("API rejects non-local writes, invalid content and executable uploads", async ({
  request,
}) => {
  expect(
    (
      await request.post("/api/projects", {
        data: { action: "delete", id: crypto.randomUUID() },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/projects", {
        headers: { origin: "https://outside.invalid" },
        data: { action: "save" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post("/api/projects", {
        headers: { origin: "http://127.0.0.1:3100" },
        data: { action: "save", project: {} },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/media", {
        headers: { origin: "http://127.0.0.1:3100" },
        multipart: {
          file: {
            name: "bad.svg",
            mimeType: "image/svg+xml",
            buffer: Buffer.from("<svg onload='alert(1)'/>"),
          },
        },
      })
    ).status(),
  ).toBe(400);
});
