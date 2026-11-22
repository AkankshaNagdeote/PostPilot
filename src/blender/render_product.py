#!/usr/bin/env python3
"""
PostPilot Headless Blender 3D Product Renderer (STORY-03.2)
============================================================
Renders high-fidelity 3D cosmetic packaging models (bottles, droppers, jars, tubes)
with 3-point studio lighting and transparent background at $0 cost.

Usage:
  # Via local Blender CLI:
  blender -b -P src/blender/render_product.py -- --name "Barrier Rescue" --type "bottle" --output "dist/renders/bottle.png"

  # Via Python CLI (Fallback/Simulation mode when Blender binary is not in PATH):
  python3 src/blender/render_product.py --name "Barrier Rescue" --type "dropper" --output "dist/renders/dropper.svg"
"""

import sys
import os
import argparse
import math

# Check if running inside Blender's embedded Python environment
IS_BLENDER = False
try:
    import bpy
    IS_BLENDER = True
except ImportError:
    IS_BLENDER = False


def parse_cli_args():
    """Extract CLI arguments, handling Blender's '--' separator if present."""
    raw_args = sys.argv
    if "--" in raw_args:
        cli_args = raw_args[raw_args.index("--") + 1:]
    else:
        cli_args = raw_args[1:]

    parser = argparse.ArgumentParser(description="PostPilot Headless Cosmetic Product Renderer")
    parser.add_argument("--name", type=str, default="SkinEthix Hero Formula", help="Product name for label")
    parser.add_argument("--type", type=str, choices=["bottle", "dropper", "jar", "tube"], default="bottle", help="Packaging form")
    parser.add_argument("--output", type=str, default="product_render.png", help="Output file path")
    parser.add_argument("--resolution", type=int, default=1080, help="Square render resolution in px (default 1080)")
    parser.add_argument("--color", type=str, default="#059669", help="Hex color code for packaging accent")
    parser.add_argument("--simulate", action="store_true", help="Force simulation mode even if Blender is present")

    return parser.parse_args(cli_args)


def hex_to_rgb(hex_code):
    """Convert hex string (e.g. #059669) to normalized RGB float tuple (0.0 to 1.0)."""
    hex_clean = hex_code.lstrip("#")
    if len(hex_clean) != 6:
        return (0.02, 0.58, 0.41)
    return tuple(int(hex_clean[i:i+2], 16) / 255.0 for i in (0, 2, 4))


def render_blender_scene(args):
    """Executes procedural 3D modeling, material creation, lighting, and rendering in Blender."""
    # 1. Clear default scene
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene

    # 2. Configure Render Settings (Cycles or EEVEE)
    scene.render.engine = "CYCLES" if "CYCLES" in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else "BLENDER_EEVEE"
    scene.render.resolution_x = args.resolution
    scene.render.resolution_y = args.resolution
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"

    # 3. Setup Camera (Eye level, subtle downward perspective)
    cam_data = bpy.data.cameras.new(name="ProductCamera")
    cam_data.lens = 85  # 85mm portrait telephoto lens to prevent cosmetic bottle distortion
    cam_obj = bpy.data.objects.new("ProductCamera", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    scene.camera = cam_obj
    cam_obj.location = (0.0, -2.8, 0.8)
    cam_obj.rotation_euler = (math.radians(76.0), 0.0, 0.0)

    # 4. Setup 3-Point Studio Lighting
    # Key Light (Warm, 45 degrees left)
    key_light = bpy.data.lights.new(name="KeyLight", type="AREA")
    key_light.energy = 150
    key_light.size = 1.2
    key_light.color = (1.0, 0.98, 0.95)
    key_obj = bpy.data.objects.new("KeyLight", key_light)
    bpy.context.collection.objects.link(key_obj)
    key_obj.location = (1.8, -1.8, 2.2)

    # Fill Light (Cool, 45 degrees right)
    fill_light = bpy.data.lights.new(name="FillLight", type="AREA")
    fill_light.energy = 80
    fill_light.size = 1.5
    fill_light.color = (0.92, 0.96, 1.0)
    fill_obj = bpy.data.objects.new("FillLight", fill_light)
    bpy.context.collection.objects.link(fill_obj)
    fill_obj.location = (-2.0, -1.6, 1.4)

    # Rim / Backlight (Edge highlight for glass/frosted contours)
    rim_light = bpy.data.lights.new(name="RimLight", type="POINT")
    rim_light.energy = 220
    rim_light.color = (1.0, 1.0, 1.0)
    rim_obj = bpy.data.objects.new("RimLight", rim_light)
    bpy.context.collection.objects.link(rim_obj)
    rim_obj.location = (0.0, 2.0, 1.8)

    # 5. Create Packaging Material
    rgb = hex_to_rgb(args.color)
    mat = bpy.data.materials.new(name="CosmeticGlassMat")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (rgb[0], rgb[1], rgb[2], 1.0)
        bsdf.inputs["Roughness"].default_value = 0.18
        if "Transmission Weight" in bsdf.inputs:
            bsdf.inputs["Transmission Weight"].default_value = 0.65
        elif "Transmission" in bsdf.inputs:
            bsdf.inputs["Transmission"].default_value = 0.65

    # Cap Material (Matte Charcoal / Gold)
    cap_mat = bpy.data.materials.new(name="CapMat")
    cap_mat.use_nodes = True
    cap_bsdf = cap_mat.node_tree.nodes.get("Principled BSDF")
    if cap_bsdf:
        cap_bsdf.inputs["Base Color"].default_value = (0.08, 0.10, 0.14, 1.0)
        cap_bsdf.inputs["Roughness"].default_value = 0.35

    # 6. Procedural Mesh Generation
    if args.type == "dropper":
        # Amber/Frosted dropper bottle body
        bpy.ops.mesh.primitive_cylinder_add(radius=0.45, depth=1.1, location=(0, 0, 0.55))
        body = bpy.context.active_object
        body.data.materials.append(mat)

        # Dropper Collar
        bpy.ops.mesh.primitive_cylinder_add(radius=0.32, depth=0.35, location=(0, 0, 1.25))
        collar = bpy.context.active_object
        collar.data.materials.append(cap_mat)

        # Rubber Pipette Bulb
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.28, location=(0, 0, 1.55))
        bulb = bpy.context.active_object
        bulb.data.materials.append(cap_mat)

    elif args.type == "jar":
        # Wide cosmetic cream jar
        bpy.ops.mesh.primitive_cylinder_add(radius=0.75, depth=0.65, location=(0, 0, 0.325))
        jar = bpy.context.active_object
        jar.data.materials.append(mat)

        # Jar Screw Cap
        bpy.ops.mesh.primitive_cylinder_add(radius=0.78, depth=0.22, location=(0, 0, 0.76))
        lid = bpy.context.active_object
        lid.data.materials.append(cap_mat)

    else:  # Standard pump bottle
        bpy.ops.mesh.primitive_cylinder_add(radius=0.48, depth=1.4, location=(0, 0, 0.7))
        body = bpy.context.active_object
        body.data.materials.append(mat)

        # Pump Neck & Head
        bpy.ops.mesh.primitive_cylinder_add(radius=0.25, depth=0.4, location=(0, 0, 1.55))
        pump = bpy.context.active_object
        pump.data.materials.append(cap_mat)

    # 7. Execute Render to Output Path
    out_dir = os.path.dirname(os.path.abspath(args.output))
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    scene.render.filepath = os.path.abspath(args.output)
    bpy.ops.render.render(write_still=True)
    print(f"[PostPilot Blender Pipeline] Successfully rendered 3D asset to {scene.render.filepath}")


def simulate_render(args):
    """
    Simulation / Fallback renderer when running outside of Blender or in CI/CD sandbox.
    Generates an isometric procedural vector/raster representation with verified dimensions.
    """
    out_dir = os.path.dirname(os.path.abspath(args.output))
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    target_path = args.output
    # If asked for .png without Blender binary, create .svg twin or verified placeholder
    is_svg = target_path.lower().endswith(".svg")
    svg_path = target_path if is_svg else target_path.rsplit(".", 1)[0] + ".svg"

    accent_hex = args.color
    res = args.resolution

    # Procedural 3D Cosmetic Silhouette SVG
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {res} {res}" width="{res}" height="{res}">
  <defs>
    <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{accent_hex}" stop-opacity="0.95" />
      <stop offset="60%" stop-color="{accent_hex}" stop-opacity="0.75" />
      <stop offset="100%" stop-color="#0B0F19" stop-opacity="0.9" />
    </linearGradient>
    <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.2" />
    </linearGradient>
    <radialGradient id="studioShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.0" />
    </radialGradient>
  </defs>

  <!-- Studio Floor Contact Shadow -->
  <ellipse cx="{res/2}" cy="{res * 0.86}" rx="{res * 0.28}" ry="{res * 0.05}" fill="url(#studioShadow)" />

  <!-- 3D Packaging Silhouette ({args.type}) -->
  <g transform="translate({res * 0.25}, {res * 0.15}) scale({res/1080})">
    <!-- Cosmetic Bottle Body -->
    <rect x="140" y="240" width="260" height="480" rx="36" fill="url(#bodyGrad)" stroke="#334155" stroke-width="2" />
    <!-- Glass Highlight Sheen -->
    <rect x="155" y="255" width="45" height="450" rx="15" fill="url(#glassReflection)" />

    <!-- Label Card -->
    <rect x="160" y="380" width="220" height="220" rx="8" fill="#0B0F19" fill-opacity="0.88" stroke="#059669" stroke-width="1.5" />
    <text x="270" y="440" font-family="-apple-system, sans-serif" font-size="20" font-weight="700" fill="#10B981" text-anchor="middle">SKINETHIX</text>
    <text x="270" y="480" font-family="-apple-system, sans-serif" font-size="16" font-weight="600" fill="#FFFFFF" text-anchor="middle">{args.name[:22]}</text>
    <text x="270" y="520" font-family="-apple-system, sans-serif" font-size="12" fill="#94A3B8" text-anchor="middle">BARRIER FORMULATION</text>
    <text x="270" y="560" font-family="-apple-system, sans-serif" font-size="11" fill="#F59E0B" text-anchor="middle">50ml / 1.7 fl.oz</text>

    <!-- Pump / Dropper Cap -->
    <rect x="220" y="160" width="100" height="80" rx="8" fill="#161B26" stroke="#475569" stroke-width="2" />
    <rect x="245" y="90" width="50" height="70" rx="6" fill="#0B0F19" />
    <rect x="235" y="70" width="70" height="25" rx="6" fill="#161B26" />
  </g>
</svg>
'''
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)

    # If output requested is not svg, touch target file with simulation metadata
    if not is_svg:
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(f"SIMULATED_BLENDER_RENDER: {args.type} - {args.name} ({res}x{res}) -> {svg_path}\n")

    print(f"[PostPilot Blender Pipeline] Headless simulation generated: {target_path} (Vector companion: {svg_path})")


def main():
    args = parse_cli_args()
    if IS_BLENDER and not args.simulate:
        render_blender_scene(args)
    else:
        simulate_render(args)


if __name__ == "__main__":
    main()
