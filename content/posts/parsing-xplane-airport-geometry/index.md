---
title: "Parsing X-Plane Airport Geometry"
subtitle: "Bezier curves and the mirroring trick"
date: 2024-12-01T10:00:00+00:00
lastmod: 2024-12-01T10:00:00+00:00
draft: false

description: "How X-Plane's apt.dat format defines airport geometry using paths with bezier curves, and the control point mirroring trick that makes it all work."

summary: "X-Plane's apt.dat format defines airport geometry using paths with bezier curves. Each bezier node stores only one control point that defines the outgoing direction. To draw a curve arriving at that node, you mirror the control point to the opposite side."

tags: ["X-Plane", "Bezier Curves", "Parsing", "Geometry", "Flight Simulation"]
categories: ["Engineering"]

lightgallery: true
pageStyle: "wide"

toc:
  enable: true
  auto: true
  keepStatic: false

code:
  copy: true
  maxShownLines: 100

linkToMarkdown: false
linkToSource: false
linkToEdit: false
linkToReport: false

share:
  enable: false
comment:
  enable: false

---

> [!ABSTRACT] TL;DR
> X-Plane's apt.dat format defines airport geometry using paths with bezier curves. The clever part: each bezier node stores only ONE control point that defines the outgoing direction. To draw a curve arriving at that node, you mirror the control point to the opposite side. Once you understand this, parsing becomes straightforward. Miss it, and you get spaghetti geometry.

I was building a tool to visualize X-Plane airports on a web map. Load an airport file, render it on MapLibre, see the taxiways and runways. Should be simple, right?

The apt.dat format looked approachable. Text-based, line by line, each line starting with a row code that tells you what kind of data follows. Runways, taxiways, boundaries, markings. I started parsing.

Runways were easy - just coordinates and dimensions. Taxiway shapes seemed straightforward too. A header line, then a series of coordinate pairs defining the boundary. Connect the dots, fill the polygon.

Then I rendered my first curved taxiway and got this:

![Why bezier curves matter](why-bezier.svg)

The left side is what happens when you just connect the dots with straight lines. The right side is what the airport should actually look like.

Real taxiways have smooth, rounded corners. Pilots don't navigate sharp 90-degree turns. X-Plane knows this, so instead of storing hundreds of points to approximate curves, it uses **bezier curves** - mathematical curves defined by just a few control points.

I knew bezier curves from graphics programming. What I didn't know was how X-Plane encoded them in a way that would confuse me for weeks.

## The Format

Every airport shape in apt.dat is built from **nodes**. Each node is either plain or bezier:

```
111 47.464000 -122.312000                           ← Plain node
112 47.465000 -122.311500 47.465500 -122.312000     ← Bezier node
```

The pattern is simple:
- **111** = plain node (just lat/lon)
- **112** = bezier node (lat/lon + control point lat/lon)
- **113/114** = close the shape (plain/bezier)
- **115/116** = end an open path (plain/bezier)

Odd numbers are plain, even numbers have bezier control points.

When you connect a plain node to another plain node, you draw a straight line. When bezier nodes are involved, you draw curves. The control point tells the curve how to bend.

Sounds simple enough. Here's where I got stuck.

## The Problem

I was parsing this taxiway corner:

```
110 1 0.25 0.00 Taxiway A
111 47.464000 -122.312000       ← Node 1 (plain)
111 47.465000 -122.312000       ← Node 2 (plain)
112 47.465500 -122.311500 47.465500 -122.312000   ← Node 3 (bezier)
111 47.465500 -122.310000       ← Node 4 (plain)
113 47.464000 -122.310000       ← Node 5 (closes shape)
```

Node 3 is a bezier node with a control point. I needed to draw a curve from Node 2 to Node 3.

A bezier curve needs control points to define its shape. For a quadratic bezier (the kind with one control point), you need: start point, control point, end point.

I had the start (Node 2) and end (Node 3). The control point was stored at Node 3. I plugged it into my bezier function.

The curve bent the wrong way.

![Wrong vs right curve direction](why-mirror-needed.svg)

I stared at this for hours. The control point was clearly pointing to the left in the data. But to get the curve to bend correctly around that corner, I needed it pointing to the right.

## The Insight

After much frustration and reading forum posts from other developers who'd been through this, I found the answer.

**The control point stored at a bezier node defines where the path goes AFTER leaving that node. It's the outgoing direction.**

Think about it from X-Plane's perspective. When you're placing nodes in their editor, you're thinking about the flow of the path. At each bezier node, you define which way the path curves as it leaves.

But when you're drawing a curve TO that node, you need the incoming direction - which is the opposite.

**The solution: mirror the control point.**

```
mirrored_control = (2 × node_position) - stored_control
```

Or in plain terms: flip it to the opposite side of the node, same distance away.

![The mirroring concept](mirroring-concept.svg)

The stored control point is like an arrow pointing where you're going next. To find where you came from, point the arrow the other way.

## The Four Connection Types

Once I understood mirroring, the rules became clear. There are four ways nodes can connect:

### Plain → Plain (111 → 111)

No curves. Just a straight line. Easy.

![Straight line between plain nodes](connection-plain-plain.svg)

### Plain → Bezier (111 → 112)

You're arriving at a bezier node. The stored control points outward (for the next segment). Mirror it to get the incoming curve direction.

![Quadratic curve from plain to bezier](connection-plain-bezier.svg)

```python
def draw_plain_to_bezier(start, end_node):
    end = end_node.position
    stored_control = end_node.control_point

    # Mirror: flip to opposite side
    mirrored = (2 * end[0] - stored_control[0],
                2 * end[1] - stored_control[1])

    return quadratic_bezier(start, mirrored, end)
```

### Bezier → Plain (112 → 111)

You're leaving a bezier node heading to a plain node. Use the stored control directly - it's already pointing in the direction you're going.

![Quadratic curve from bezier to plain](connection-bezier-plain.svg)

```python
def draw_bezier_to_plain(start_node, end):
    start = start_node.position
    control = start_node.control_point  # Use directly, no mirroring

    return quadratic_bezier(start, control, end)
```

### Bezier → Bezier (112 → 112)

The interesting case. You need a cubic bezier with two control points:
- First control: the outgoing control from the start node (use directly)
- Second control: the incoming control for the end node (mirror it)

![Cubic curve between bezier nodes](connection-bezier-bezier.svg)

```python
def draw_bezier_to_bezier(start_node, end_node):
    p0 = start_node.position
    p1 = start_node.control_point  # Outgoing, use directly

    p3 = end_node.position
    stored_p2 = end_node.control_point
    p2 = (2 * p3[0] - stored_p2[0],  # Incoming, mirror it
          2 * p3[1] - stored_p2[1])

    return cubic_bezier(p0, p1, p2, p3)
```

This creates smooth S-curves. Getting the controls backwards gives you spaghetti.

## Sharp Corners: The Split Bezier

Bezier curves are smooth by nature. The control point at each node ensures the path flows continuously - the incoming curve and outgoing curve share a tangent direction.

But what if you actually want a sharp corner?

### The Problem with Smooth Curves

Imagine a taxiway that turns 90 degrees. With normal bezier curves, you'd get a smooth, rounded corner. Sometimes that's fine. But sometimes you need an actual corner - a sharp change in direction.

If you use a single bezier node at the corner, the curve flows smoothly through it. The control point defines both the incoming and outgoing direction (via mirroring), so they're always aligned.

### The Solution: Split the Node

X-Plane's trick is to place **two nodes at the exact same position** with different control points:

![Split bezier](split-bezier.svg)

```
112 47.465 -122.311 47.465 -122.312    ← First node, control pointing up
112 47.465 -122.311 47.466 -122.311    ← Second node, same position, control pointing right
```

Both nodes occupy the same coordinates (47.465, -122.311). But their control points aim different directions.

![Split node creating a sharp corner](split-node.svg)

### Why This Works

The first node's control point handles the **incoming** curve (via mirroring). The second node's control point handles the **outgoing** curve (used directly).

Because they're separate nodes with independent control points, the incoming and outgoing directions don't have to align. You get a corner.

Think of it like this: normally, a bezier node is a smooth joint where the path bends but doesn't break. A split bezier is like cutting the path at that point and starting fresh - same position, new direction.

### When You'll See Split Beziers

- Sharp turns in taxiways
- Corners of buildings or structures
- Any place where smooth flow would look wrong
- Transitions between different curve directions

Here's the trap: when you see two consecutive nodes at the same position, your bezier code might try to draw a curve from a point to itself. This creates a spike artifact:

![The spike trap](spike-trap.svg)

**The fix:** Before drawing any curve, check if start and end positions are identical. If so, skip the curve - it's a split node.

```python
def should_draw_curve(start_pos, end_pos):
    # Skip degenerate curves (split nodes)
    if start_pos[0] == end_pos[0] and start_pos[1] == end_pos[1]:
        return False
    return True
```

## Winding Order: Holes and Fills

A taxiway shape might have holes in it - cutouts for buildings, equipment, whatever. How does X-Plane distinguish the outer boundary from the holes?

**Winding order.** The direction you trace the points:

- Counter-clockwise = outer boundary (fill this)
- Clockwise = hole (cut this out)

![Winding order for outer boundary vs holes](winding-order.svg)

To detect winding order programmatically, calculate the signed area of the polygon:

```python
def signed_area(coords):
    area = 0
    for i in range(len(coords) - 1):
        x1, y1 = coords[i]
        x2, y2 = coords[i + 1]
        area += (x2 - x1) * (y2 + y1)
    return area / 2

def is_clockwise(coords):
    return signed_area(coords) < 0
```

Negative area = clockwise = hole. Positive = counter-clockwise = fill.

## The Complete Picture

Here's the full flow for parsing an airport shape:

1. **Read the header** (row code 110 for pavements) to get surface type, smoothness
2. **Process nodes** in order:
   - Track whether you're in a bezier sequence
   - For each node, determine the connection type to the previous node
   - Draw the appropriate line or curve
3. **Handle ring closures** (113/114) by connecting back to the first node
4. **After closure**, more nodes can follow - these are holes
5. **Detect winding** to distinguish outer boundary from holes
6. **Assemble the polygon** with proper hole handling

The result: accurate airport geometry from a compact text format.

## Gotchas I Hit

A few things that will trip you up:

### Coordinate Order

apt.dat uses latitude, longitude. Most mapping libraries expect longitude, latitude. You'll need to swap them.

```python
# apt.dat gives you:
lat, lon = 47.464, -122.312

# MapLibre/GeoJSON wants:
geojson_coord = [lon, lat]  # Swap!
```

### Control Points Can Be Anywhere

The control point doesn't have to be near the node. It can be very close (gentle curve), very far (sharp bend), or even at the same position as the node (effectively making it a plain node).

### The First Node Problem

If the first node of a shape is a bezier node, there's no previous node to draw a curve FROM. Just record its position and control - they'll be used when processing the second node.

### Multiple Rings

A single pavement (one 110 header) can contain multiple closed rings. After a 113/114 closes a ring, more nodes can follow to define additional rings (holes).

```
110 1 0.25 0.00 Apron
111 ...    ← Outer ring starts
111 ...
113 ...    ← Outer ring closes
111 ...    ← Hole starts
111 ...
113 ...    ← Hole closes
```

## Pavement Edge Markings: The Hidden Feature

Here's something that surprised me late in development: pavements aren't just filled shapes. They can have **painted edge lines and embedded lights** around their boundaries.

### Edge Markings on Pavement Nodes

Remember the node format for pavements? I showed you the basic version:

```
111 latitude longitude                           ← Plain node
112 latitude longitude ctrl_lat ctrl_lon         ← Bezier node
```

But the full format has optional fields at the end:

```
111 latitude longitude [line_type] [light_type]
112 latitude longitude ctrl_lat ctrl_lon [line_type] [light_type]
```

Wait, those look exactly like linear feature nodes! And they work the same way:

- `line_type`: Painted marking style (0=none, 1=solid yellow, 4=hold bars, etc.)
- `light_type`: Embedded lights (0=none, 102=blue edge, etc.)

### Real Example

Here's an actual pavement from an airport file:

```
110 1 0.25 0.00 Apron B
111 47.464 -122.311 0 0
111 47.465 -122.311 0 0
112 47.466 -122.310 47.465 -122.310 30 102   ← SOLID_RED edge + blue lights!
114 47.464 -122.310 30 102                    ← Closing node also has markings
```

The `30 102` means: paint a solid red line along this edge, and embed blue edge lights.

### Why This Makes Sense

Think about real airport aprons. The pavement itself has a shape - that's the filled polygon. But around the edge, there might be:

- Red boundary lines marking restricted areas
- Blue edge lights for night operations
- Yellow hold lines at taxiway entrances

Instead of requiring scenery designers to trace two separate features (a pavement AND a linear feature on top of it), X-Plane lets you define both at once. The pavement boundary doubles as a linear feature.

### Extracting Edge Markings

When parsing pavements, you need to check if any boundary nodes have non-zero line or light types:

```python
def extract_edge_markings(pavement_paths):
    """Extract linear features from pavement edge markings."""
    edge_features = []

    for path in pavement_paths:
        # Check if this path has any edge markings
        has_markings = any(
            lt.line_type > 0 or lt.light_type > 0
            for lt in path.line_types
        )

        if not has_markings:
            continue

        # Treat the boundary coordinates as a linear feature
        # Split by type changes, just like standalone linear features
        features = split_by_type(path.coordinates, path.line_types)
        edge_features.extend(features)

    return edge_features
```

The edge markings use the same type system and segment splitting logic as standalone linear features (row code 120). You can reuse all that parsing code.

### The Gotcha

Edge markings on pavement boundaries are **closed loops** - the last point connects back to the first. But when you split by type, you might create segments that span the closure point.

Handle this the same way you handle any polygon closure: when processing the segment from the last node back to the first, use the last node's type.

## Why This Matters

X-Plane's apt.dat format is used by thousands of airports in the default scenery, plus countless community add-ons. Understanding how it encodes geometry unlocks:

- Custom visualization tools
- Scenery analysis and validation
- Conversion to other formats
- Procedural airport generation

The bezier mirroring trick is the key insight. Once you understand that the stored control point is "where I'm going" and you need to flip it for "where I came from," everything falls into place.

*The apt.dat format has more features - linear markings, lighting, signs, frequencies. But the geometry parsing is the hard part. Get the beziers right, and the rest is straightforward.*
