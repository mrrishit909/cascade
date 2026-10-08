"""CASCADE kit: a die block prop and an atomic lattice unit cell. Deterministic.
Run: Blender -b -P model/build.py   (writes model/source.blend, model/exports/*.glb, model/renders/poster.png)"""
import bpy, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "exports")
os.makedirs(OUT, exist_ok=True)
os.makedirs(os.path.join(HERE, "renders"), exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def mat(name, color, metal=0.0, rough=0.5, emit=None, strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Metallic"].default_value = metal
    b.inputs["Roughness"].default_value = rough
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = strength
    return m

M = {
    "silicon": mat("Silicon", (0.09, 0.1, 0.13), 0.3, 0.3),
    "copper": mat("Copper", (0.85, 0.5, 0.26), 0.9, 0.3),
    "violet": mat("WaferViolet", (0.46, 0.34, 1.0), 0, 0.3, (0.46, 0.34, 1.0), 1.8),
    "iridescent": mat("Iridescent", (0.37, 0.95, 0.82), 0, 0.2, (0.37, 0.95, 0.82), 1.4),
}

def obj(name, mesh_fn, material, loc=(0, 0, 0), parent=None):
    bpy.ops.object.select_all(action="DESELECT")
    mesh_fn()
    o = bpy.context.active_object
    o.name = name
    o.location = loc
    o.data.materials.append(M[material] if isinstance(material, str) else material)
    if parent:
        o.parent = parent
    return o

def empty(name, loc, parent=None):
    e = bpy.data.objects.new(name, None)
    scene.collection.objects.link(e)
    e.location = loc
    if parent:
        e.parent = parent
    return e

def smooth(o):
    for p in o.data.polygons: p.use_smooth = True

# --- die block: the representative die, instanced at wafer positions and stood on its own at die/logic scale
die_root = empty("DieBlock", (0, 0, 0))
body = obj("DieBody", lambda: bpy.ops.mesh.primitive_cube_add(size=1), "silicon", (0, 0, 0.05), die_root)
body.scale = (1, 1, 0.1)
trace = obj("DieTrace", lambda: bpy.ops.mesh.primitive_cube_add(size=1), "copper", (0, 0, 0.101), die_root)
trace.scale = (0.9, 0.02, 0.01)
smooth(body)

# --- lattice unit cell: a small sphere standing for one atomic site, instanced in a grid at the deepest zoom
lattice_root = empty("LatticeCell", (0, 0, 0))
site = obj("LatticeSite", lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.12), "iridescent", (0, 0, 0), lattice_root)
bond = obj("LatticeBond", lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.02, depth=0.5), "violet", (0.25, 0, 0), lattice_root)
bond.rotation_euler = (0, math.pi / 2, 0)
smooth(site)

def hide(o):
    o.hide_render = True
    for c in o.children: hide(c)
bpy.ops.object.camera_add(location=(2.4, -2.6, 1.8)); cam_o = bpy.context.active_object
cam_o.name = "PosterCam"; scene.camera = cam_o; cam_o.data.lens = 40
cam_o.rotation_euler = (1.15, 0, 0.62)
for name, loc, e, col in (("Key", (-2, -4, 3), 900, (0.46, 0.34, 1.0)), ("Rim", (3, 2, 2), 700, (0.37, 0.95, 0.82)), ("Fill", (0, -1, -1), 200, (1, 1, 1))):
    bpy.ops.object.light_add(type="POINT", location=loc); l = bpy.context.active_object
    l.name = name; l.data.energy = e; l.data.color = col
world = bpy.data.worlds.new("Graphite"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.012, 0.013, 0.016, 1)
scene.render.engine = "BLENDER_EEVEE_NEXT"
scene.render.resolution_x, scene.render.resolution_y = 1280, 720
scene.render.filepath = os.path.join(HERE, "renders", "poster.png")

def export(name, parents):
    bpy.ops.object.select_all(action="DESELECT")
    def pick(o):
        o.select_set(True)
        for c in o.children: pick(c)
    for p in parents: pick(p)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, name), export_format="GLB", use_selection=True,
                              export_apply=True, export_yup=True, export_cameras=False, export_lights=False)

export("die-block.glb", [die_root])
export("lattice-cell.glb", [lattice_root])
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "source.blend"))
try:
    bpy.ops.render.render(write_still=True)
except Exception as e:
    print("poster render failed:", e)
print("BUILD OK")
