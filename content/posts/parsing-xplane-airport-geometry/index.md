---
title: "Parsing apt.dat: X-Plane Airport Bezier Curves"
subtitle: "Control point mirroring and why your curves bend wrong"
date: 2026-02-05T10:00:00+00:00
lastmod: 2026-02-05T10:00:00+00:00
draft: false

description: "How X-Plane's apt.dat format defines airport geometry using paths with bezier curves, and the control point mirroring trick that makes it all work."

summary: "X-Plane's apt.dat format defines airport geometry using paths with bezier curves. Each bezier node stores only one control point that defines the outgoing direction. To draw a curve arriving at that node, you mirror the control point to the opposite side."

tags: ["X-Plane", "Bezier Curves", "Parsing", "Geometry", "Flight Simulation"]
categories: ["Engineering"]
featuredImage: "pavement.png"
featuredImagePreview: "pavement.png"

lightgallery: true
pageStyle: "wide"

math:
  enable: true

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

Runways were easy: coordinates and dimensions. Taxiways seemed straightforward too. A header line, then coordinate pairs defining the boundary. Connect the dots, fill the polygon.

Then I rendered my first curved taxiway:

![Why bezier curves matter](why-bezier.svg)

Left: connecting coordinates with straight lines. Right: what it should look like.

The format uses **bezier curves**. The problem: storing smooth curves as coordinate lists requires hundreds of points. A bezier curve solves this by defining the curve mathematically with just 3-4 points (start, end, and 1-2 control points). You then sample the curve at whatever resolution you need. Store 4 points, generate 128 when rendering. The curve stays smooth at any zoom level because it's computed, not approximated.

I knew bezier curves from graphics programming. What I didn't know was how X-Plane encoded them in a way that would confuse me for weeks.

## The apt.dat File

Before diving into geometry, let's understand what we're working with.

X-Plane stores **all** airport data in a single file called `apt.dat`. Every airport in the world, from major international hubs to tiny grass strips, packed into one text file.

### Why Text?

It seems inefficient, but text has advantages:
- **Human readable**: you can open it in any editor and understand what you're looking at
- **Version control friendly**: scenery developers can diff and merge changes
- **Portable**: no endianness issues, no binary format versioning
- **Extensible**: new features are just new row codes

### The Structure

The file is line-based. Each line starts with a **row code**, a number that tells you what kind of data follows:

```
1      ← Airport header (starts a new airport)
100    ← Runway definition
110    ← Pavement/taxiway
120    ← Painted line (linear feature)
111    ← Path node (plain)
112    ← Path node (bezier)
...
```

### An Airport in apt.dat

Here's a simplified view of how one airport looks:

```
1 1000 0 0 KSEA Seattle-Tacoma Intl
100 45.72 1 1 0.25 0 2 1 16L 47.4647 -122.3118 ...
100 45.72 1 1 0.25 0 2 1 16C 47.4598 -122.3087 ...
110 1 0.25 0.00 Taxiway A
111 47.4640 -122.3120
111 47.4650 -122.3120
112 47.4655 -122.3115 47.4655 -122.3120
113 47.4640 -122.3100
120 Centerline A
111 47.4645 -122.3115 1 0
115 47.4655 -122.3110 1 0
```

| Line | Code | What it means |
|:----:|:----:|---------------|
| 1 | `1` | Airport header: elevation 1000ft, ICAO "KSEA" |
| 2-3 | `100` | Two runways (16L and 16C) |
| 4 | `110` | Start of a pavement shape (Taxiway A) |
| 5-8 | `111-113` | Nodes defining the pavement boundary |
| 9 | `120` | Start of a painted line (Centerline A) |
| 10-11 | `111-115` | Nodes defining the line path |

### The Parsing Challenge

The tricky part: **context matters**. Code `111` after a `110` is a pavement boundary node. Code `111` after a `120` is a painted line node.

And geometry doesn't just end. You need to know when one feature stops and another begins. That's where the closing codes (113/114) and ending codes (115/116) come in.

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

## How Bezier Curves Work

A bezier curve is defined by control points. The curve starts at the first point, ends at the last point, and bends toward the middle control points without passing through them.

### Quadratic Bezier (One Control Point)

Three points: **P0** (start), **P1** (control), **P2** (end). The curve at parameter t (from 0 to 1):

$ B(t) = (1-t)^2 P_0 + 2(1-t)t \cdot P_1 + t^2 P_2 $

In X-Plane, this is a **111 → 112** or **112 → 111** connection:

```
111 47.464 -122.312                       ← P0 (start)
112 47.466 -122.310  47.465 -122.311      ← P2 (end) + control point
```

The curve bends toward the control point as it travels from P0 to P2.

### Cubic Bezier (Two Control Points)

Four points: **P0**, **P1** (control 1), **P2** (control 2), **P3**:

$ B(t) = (1-t)^3 P_0 + 3(1-t)^2 t \cdot P_1 + 3(1-t)t^2 P_2 + t^3 P_3 $

This happens with **112 → 112** connections. Each bezier node contributes one control point:

```
112 47.464 -122.312  47.464 -122.311      ← P0 + outgoing control (P1)
112 47.466 -122.310  47.466 -122.311      ← P3 + outgoing control (→ mirror for P2)
```

Cubic beziers can make S-curves. Two control points means more flexibility.

### Implementation

To draw a curve, sample the formula at many t values (we use 128 steps):

```python
# Quadratic: B(t) = (1-t)²P0 + 2(1-t)t·P1 + t²P2
for t in [i/128 for i in range(129)]:
    mt = 1 - t
    point = mt*mt*P0 + 2*mt*t*P1 + t*t*P2
```

The control points pull the curve toward them without the curve passing through them.

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

But when you're drawing a curve TO that node, you need the incoming direction, which is the opposite.

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

You're leaving a bezier node heading to a plain node. Use the stored control directly since it's already pointing in the direction you're going.

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

Bezier curves are smooth by nature. The control point at each node ensures the path flows continuously. The incoming curve and outgoing curve share a tangent direction.

But what if you actually want a sharp corner?

### The Problem with Smooth Curves

Imagine a taxiway that turns 90 degrees. With normal bezier curves, you'd get a smooth, rounded corner. Sometimes that's fine. But sometimes you need an actual corner, a sharp change in direction.

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

Think of it like this: normally, a bezier node is a smooth joint where the path bends but doesn't break. A split bezier is like cutting the path at that point and starting fresh. Same position, new direction.

### When You'll See Split Beziers

- Sharp turns in taxiways
- Corners of buildings or structures
- Any place where smooth flow would look wrong
- Transitions between different curve directions

Here's the trap: when you see two consecutive nodes at the same position, your bezier code might try to draw a curve from a point to itself. This creates a spike artifact:

![The spike trap](spike-trap.svg)

**The fix:** Before drawing any curve, check if start and end positions are identical. If so, skip the curve. It's a split node.

```python
def should_draw_curve(start_pos, end_pos):
    # Skip degenerate curves (split nodes)
    if start_pos[0] == end_pos[0] and start_pos[1] == end_pos[1]:
        return False
    return True
```

## Winding Order: Holes and Fills

A taxiway shape might have holes in it: cutouts for buildings, equipment, whatever. How does X-Plane distinguish the outer boundary from the holes?

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
4. **After closure**, more nodes can follow. These are holes
5. **Detect winding** to distinguish outer boundary from holes
6. **Assemble the polygon** with proper hole handling

The result: accurate airport geometry from a compact text format.

## How Pavement Parsing Actually Works

Let's trace through parsing a complete pavement from start to finish.

### Step 1: Detect the Header

When the parser sees row code `110`, it knows a pavement is starting:

```
110 1 0.25 0.00 Taxiway A
    │  │    │    └── Name (can have spaces)
    │  │    └── Texture heading (degrees)
    │  └── Smoothness (0.0 to 1.0)
    └── Surface type (1=asphalt, 2=concrete, etc.)
```

The parser saves these properties and prepares to collect nodes.

### Step 2: Collect Boundary Nodes

After the header, the parser reads nodes line by line:

```
111 47.464000 -122.312000       ← First node
111 47.465000 -122.312000       ← Second node
112 47.465500 -122.311500 ...   ← Third node (bezier)
111 47.465500 -122.310000       ← Fourth node
```

Each node is processed immediately:
- Calculate any curves from the previous node
- Add the resulting points to the coordinate array
- Track line types and light types if present

### Step 3: Close the Ring

When the parser hits `113` or `114`, the shape closes:

```
113 47.464000 -122.310000       ← Closing node
```

This does three things:
1. Process this final node (drawing curve/line from previous)
2. Connect back to the **first** node (completing the loop)
3. Finalize this ring as a closed polygon

### Step 4: Check for Holes

Here's what surprised me: **parsing doesn't stop at 113/114**.

After closing a ring, the parser keeps reading. If more nodes follow, they define another ring, usually a hole:

```
110 1 0.25 0.00 Apron with building cutout
111 47.464 -122.312              ← Outer ring starts
111 47.465 -122.312                (counter-clockwise)
111 47.465 -122.311
113 47.464 -122.311              ← Outer ring closes
111 47.4643 -122.3117            ← Hole starts (new ring!)
111 47.4647 -122.3117              (clockwise = cut out)
111 47.4647 -122.3113
113 47.4643 -122.3113            ← Hole closes
```

One `110` header, two closed rings. The first is the pavement boundary, the second is a hole cut out of it.

### Step 5: Determine Winding Order

How does the parser know which ring is the outer boundary vs a hole?

**Winding order**, the direction points are traced. Positive signed area (counter-clockwise) means outer boundary. Negative (clockwise) means hole.

### Step 6: Stop Parsing

Parsing stops when the parser encounters:
- A new feature header (110, 120, 130, 100, etc.)
- End of file
- Row codes 115/116 (for open paths like painted lines)

The parser returns all collected rings, tagged as outer boundary or hole.

## Bezier Issues We Hit

Building this parser wasn't smooth sailing. Here are the bugs we encountered.

### The Missing Cubic Bezier

**Symptom:** Some curved taxiways looked almost right, but had subtle kinks.

**Cause:** We only implemented quadratic bezier curves. But when two bezier nodes are consecutive (112 → 112), you need a **cubic** bezier with four control points.

**Fix:** Detect 112 → 112 sequences and use cubic bezier with:
- P0: first node position
- P1: first node's control (use directly)
- P2: second node's control (**mirror it**)
- P3: second node position

### The Spike Artifact

**Symptom:** Random sharp spikes appearing at certain corners.

**Cause:** Split beziers. When X-Plane wants a sharp corner, it places **two nodes at the exact same position** with different control points. Our parser tried to draw a curve from A to B, but they're the same point. A bezier from a point to itself creates a spike.

**Fix:** Before drawing any curve, check if start and end positions are identical. If so, skip the curve but still record the coordinate.

### Duplicate Points at Segment Boundaries

**Symptom:** Tiny rendering artifacts and bloated coordinate arrays.

**Cause:** When adding bezier curve points, we'd sometimes add the same point twice: once as the end of one segment, once as the start of the next.

**Fix:** Check if the new point matches the last added point before appending.

### The Mirroring Discovery

**Symptom:** All curves bent the wrong direction. Every single one.

**Cause:** We assumed the control point stored at a bezier node was for the **incoming** curve. It's not. It's for the **outgoing** curve.

**Fix:** When drawing a curve **to** a bezier node, mirror the control point to the opposite side.

### Low Resolution Curves

**Symptom:** Curves looked faceted, like low-poly models.

**Cause:** Initially used 16 sample points per bezier curve. Fine for small curves, but longer curves looked chunky.

**Fix:** Increase resolution to 128 points. The performance cost is negligible since we generate coordinates once, not every frame.

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

If the first node of a shape is a bezier node, there's no previous node to draw a curve FROM. Just record its position and control. They'll be used when processing the second node.

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

Think about real airport aprons. The pavement itself has a shape, that's the filled polygon. But around the edge, there might be:

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

Edge markings on pavement boundaries are **closed loops**. The last point connects back to the first. But when you split by type, you might create segments that span the closure point.

Handle this the same way you handle any polygon closure: when processing the segment from the last node back to the first, use the last node's type.

## Why Parse apt.dat?

The apt.dat format is publicly documented and used by multiple flight simulators. [X-Plane](https://www.x-plane.com/) uses it natively. [FlightGear](https://www.flightgear.org/) uses the same format.

The [X-Plane Scenery Gateway](https://gateway.x-plane.com/) hosts community-contributed airport data. You can download apt.dat files for over 38,000 airports, modify them, and submit improvements back.

If you're building:
- Visualization tools for airport layouts
- Converters to GeoJSON, Shapefile, or other GIS formats
- Validation scripts for scenery submissions
- Procedural generation pipelines

You'll need to understand the bezier encoding. The mirroring rule: stored control points define the outgoing direction, so flip them for incoming curves.

## Resources

References and useful tools:

- [Understanding the Logic of Bezier Control Points in apt.dat](https://forums.x-plane.org/forums/topic/66713-understanding-the-logic-of-bezier-control-points-in-aptdat/) - Forum thread explaining the mirroring logic
- [Carlos Bergillos' blog post on apt.dat](https://cbergillos.com/blog/2022-07-11-xplane-aptdat/) - Format structure walkthrough
- [xplane_apt_convert](https://github.com/CarlosBergillos/xplane_apt_convert) - Python library for converting apt.dat to GeoJSON and other formats
- [X-Plane Scenery Gateway](https://gateway.x-plane.com/) - Community airport data repository
- [apt.dat specification](https://developer.x-plane.com/article/airport-data-apt-dat-file-format-specification/) - The official format documentation
