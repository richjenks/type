#!/usr/bin/env python3

import sys
sys.dont_write_bytecode = True

import pathlib
import re
import shutil
import subprocess


ROOT = pathlib.Path(__file__).resolve().parent
SOURCE_ICON = ROOT / "icon.png"


def fail(message: str, code: int = 1) -> None:
	print(f"error: {message}", file=sys.stderr)
	raise SystemExit(code)


def find_imagemagick_cmd() -> list[str]:
	for candidate in ("magick", "convert"):
		executable = shutil.which(candidate)
		if not executable:
			continue

		try:
			result = subprocess.run(
				[executable, "--version"],
				check=False,
				capture_output=True,
				text=True,
			)
		except OSError:
			continue

		version_text = f"{result.stdout}\n{result.stderr}"
		if "ImageMagick" in version_text:
			return [executable]

	return []


def render_png(source: pathlib.Path, dest: pathlib.Path, size: int, magick_cmd: list[str]) -> None:
	subprocess.run(
		[
			*magick_cmd,
			str(source),
			"-auto-orient",
			"-resize",
			f"{size}x{size}^",
			"-gravity",
			"center",
			"-extent",
			f"{size}x{size}",
			str(dest),
		],
		check=True,
	)


def render_ico(source: pathlib.Path, dest: pathlib.Path, magick_cmd: list[str]) -> None:
	subprocess.run(
		[
			*magick_cmd,
			str(source),
			"-auto-orient",
			"-define",
			"icon:auto-resize=16,24,32,48",
			str(dest),
		],
		check=True,
	)


def main() -> int:
	if not SOURCE_ICON.exists():
		fail(f"source file not found: {SOURCE_ICON.name}")

	magick_cmd = find_imagemagick_cmd()
	if not magick_cmd:
		fail("ImageMagick is not available on PATH (expected `magick` or `convert`).")

	png_targets = sorted(
		path
		for path in ROOT.glob("icon-*.png")
		if path.name != SOURCE_ICON.name
	)
	ico_targets = sorted(ROOT.glob("icon*.ico"))

	if not png_targets and not ico_targets:
		fail("no existing icon targets found (expected `icon-*.png` and/or `icon*.ico`).")

	size_pattern = re.compile(r"(\d+)(?=\.png$)")

	for target in png_targets:
		match = size_pattern.search(target.name)
		if not match:
			print(f"skip: {target.name} (no size token in filename)")
			continue

		size = int(match.group(1))
		render_png(SOURCE_ICON, target, size, magick_cmd)
		print(f"wrote: {target.name} ({size}x{size})")

	for target in ico_targets:
		render_ico(SOURCE_ICON, target, magick_cmd)
		print(f"wrote: {target.name} (16/24/32/48)")

	print("done")
	return 0


if __name__ == "__main__":
	try:
		raise SystemExit(main())
	except subprocess.CalledProcessError as exc:
		fail(f"ImageMagick command failed with exit code {exc.returncode}.")
