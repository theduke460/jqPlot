# jqPlot

Pure JavaScript plotting plugin for jQuery.

**Project source**: https://github.com/theduke460/jqPlot

---

## History

jqPlot is a legacy JavaScript/jQuery data plotting library that had fallen out
of maintenance, however it produces graphs that are arguably aesthetically
superior to more modern graphing frameworks.  With the advent of AI it has been
possible to, with significant effort, resurrect this library.  Some features
may still have some issues (most have been tested and are represented in the
'demo*.html' pages in the demo folder), however all features will soon be tested.

If jqPlot does not have an active web presence, then that will be taken care of
as well.

## Overview

jqPlot is a plotting and charting plugin for the jQuery JavaScript framework.
It produces line, bar, pie, donut, bubble, candlestick, funnel, mekko, pyramid,
meter gauge, block, and Bézier curve charts — all rendered on HTML5 canvas —
with a rich set of enhancement plugins for trendlines, point labels, date axes,
highlighting, drag-and-drop, and more.

This is a modernized fork of the original jqPlot project.  The legacy IE/excanvas
compatibility shims, the Grunt toolchain, and the bundled jQuery copy have all
been removed.  The build pipeline now uses **esbuild** and **clean-css**.

---

## Basic Usage

jqPlot requires **jQuery 1.9 or later**.  Load jQuery from a CDN (recommended),
then include the jqPlot core and CSS from `dist/`:

```html
<link  rel="stylesheet" href="dist/jquery.jqplot.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script src="dist/jquery.jqplot.min.js"></script>
```

Load any plugins you need from `dist/plugins/`.  **Plugin load order matters** —
if one plugin depends on another, the dependency must appear first:

```html
<!-- canvasTextRenderer must precede canvasAxisLabelRenderer -->
<script src="dist/plugins/jqplot.canvasTextRenderer.min.js"></script>
<script src="dist/plugins/jqplot.canvasAxisLabelRenderer.min.js"></script>

<!-- pyramid axis/grid renderers must precede pyramidRenderer -->
<script src="dist/plugins/jqplot.pyramidAxisRenderer.min.js"></script>
<script src="dist/plugins/jqplot.pyramidGridRenderer.min.js"></script>
<script src="dist/plugins/jqplot.pyramidRenderer.min.js"></script>
```

Then create a chart by calling `$.jqplot()` on a target `<div>` with explicit
width and height:

```html
<div id="chart" style="width:480px; height:300px;"></div>
<script>
$(document).ready(function () {
    $.jqplot('chart', [[3, 7, 9, 5, 12]], {
        grid: { shadow: false },
        series: [{ label: 'Series 1' }],
        legend: { show: true }
    });
});
</script>
```

---

## Chart Types

### Core (no plugin required)

| Type | Notes |
|------|-------|
| **Line** | Default renderer. Also supports area (filled), scatter (markers only), and step variants via series options. |

### Renderer Plugins

| Plugin file | Chart type |
|-------------|------------|
| `jqplot.barRenderer` | Vertical and horizontal bar charts; stacked bars |
| `jqplot.pieRenderer` | Pie charts |
| `jqplot.donutRenderer` | Donut / ring charts |
| `jqplot.bubbleRenderer` | Bubble charts |
| `jqplot.ohlcRenderer` | OHLC, Candlestick, and Hi-Low-Close financial charts |
| `jqplot.funnelRenderer` | Funnel / sales-pipeline charts |
| `jqplot.mekkoRenderer` | Marimekko / mosaic charts (requires `mekkoAxisRenderer`) |
| `jqplot.pyramidRenderer` | Population pyramid charts (requires `pyramidAxisRenderer` + `pyramidGridRenderer`, both of which **must be loaded before** `pyramidRenderer`) |
| `jqplot.meterGaugeRenderer` | Speedometer-style gauge |
| `jqplot.blockRenderer` | Block / scatter-label charts |
| `jqplot.BezierCurveRenderer` | Smooth Bézier curve series |

### Axis Plugins

| Plugin file | Purpose |
|-------------|---------|
| `jqplot.categoryAxisRenderer` | String / categorical tick labels |
| `jqplot.dateAxisRenderer` | Time-series x-axis with date parsing and strftime formatting |
| `jqplot.logAxisRenderer` | Logarithmic scale axis |
| `jqplot.canvasAxisLabelRenderer` | Rotated axis labels on canvas (requires `canvasTextRenderer`) |
| `jqplot.canvasAxisTickRenderer` | Rotated tick labels on canvas (requires `canvasTextRenderer`) |

### Enhancement Plugins

| Plugin file | Purpose |
|-------------|---------|
| `jqplot.trendline` | Computed linear or exponential trendline overlay on any series |
| `jqplot.pointLabels` | Data-value labels placed at each data point |
| `jqplot.highlighter` | Tooltip on mouse hover |
| `jqplot.cursor` | Crosshair cursor with coordinate display |
| `jqplot.canvasOverlay` | Draw arbitrary shapes and lines on top of any chart |
| `jqplot.dragable` | Draggable data points |

---

## Building from Source

### Requirements

- **Node.js** 18 or later
- **npm** (included with Node.js)

The build uses [esbuild](https://esbuild.github.io/) for JavaScript bundling
and minification, and [clean-css-cli](https://github.com/clean-css/clean-css-cli)
for CSS minification.  Both are installed automatically via `npm install`.

> **Note:** The legacy Grunt-based build (`Gruntfile.js`) is retained in the
> repository for reference but is no longer the active build system.  Use the
> npm scripts below.

### Install dependencies

```bash
npm install
```

### Build

Compile all source files in `src/` into the `dist/` directory:

```bash
npm run build
```

This produces:

```
dist/
  jquery.jqplot.js        # concatenated core (unminified)
  jquery.jqplot.min.js    # minified core
  jquery.jqplot.css       # stylesheet (token-substituted)
  jquery.jqplot.min.css   # minified stylesheet
  plugins/
    jqplot.*.js           # individual plugins (unminified)
    jqplot.*.min.js       # individual plugins (minified)
```

The `dist/` directory is **not committed to the repository** (it is listed in
`.gitignore`).  Run `npm run build` after every clone or after any source change
before serving pages that reference `dist/`.

### Release archive

Create a distributable `.zip` of the entire `dist/` directory:

```bash
npm run release
```

This produces `jquery.jqplot.<version>.zip` in the repo root.

---

## Demo Pages

The `demo/` directory contains example pages that reference `dist/` with relative
paths (`../dist/`).  Serve them through a web server (not via `file://` URLs) to
avoid browser security restrictions on local file access.

| File | Contents |
|------|----------|
| `demo/index.html` | Pie, Donut, Vertical Bar, Horizontal Bar |
| `demo/demo2.html` | Line + Trendline, Bubble, Candlestick, Meter Gauges |
| `demo/demo3.html` | Funnel, Mekko, Pyramid, Bézier Curve |
| `demo/demo5.html` | Block, Trendline, Point Labels, Date Axis |

> **Nginx / reverse-proxy caching note:** jqPlot's JavaScript and CSS files are
> typically served with long `Cache-Control` / `Expires` headers.  After a build,
> force the browser to fetch updated files with a hard refresh (`Ctrl+Shift+R`),
> or temporarily set `expires -1` in your Nginx location block during development.

---

## Plugin Load Order

Some plugins depend on others and **must** be loaded in the correct order or
the dependent plugin will attempt to fetch its dependency via an Ajax call
(which will fail unless `$.jqplot.pluginLocation` is configured):

| Load first | Then load |
|------------|-----------|
| `canvasTextRenderer` | `canvasAxisLabelRenderer`, `canvasAxisTickRenderer` |
| `pyramidAxisRenderer`, `pyramidGridRenderer` | `pyramidRenderer` |
| `mekkoAxisRenderer` | `mekkoRenderer` (or load together — order is flexible here) |

---

## Date Axis Format Strings

`dateAxisRenderer` uses **strftime** codes in `tickOptions.formatString`:

| Code | Example | Meaning |
|------|---------|---------|
| `%Y` | `2024` | 4-digit year |
| `%y` | `24` | 2-digit year |
| `%b` | `Apr` | Abbreviated month name |
| `%B` | `April` | Full month name |
| `%m` | `04` | Month number (zero-padded) |
| `%e` | `8` | Day of month (no leading zero) |
| `%d` | `08` | Day of month (zero-padded) |
| `%a` | `Mon` | Abbreviated weekday |
| `%H` | `14` | Hour, 24h (zero-padded) |
| `%M` | `30` | Minutes (zero-padded) |

Common combinations:

```javascript
tickOptions: { formatString: '%b %e' }       // Apr 8
tickOptions: { formatString: '%b %e, %Y' }   // Apr 8, 2024
tickOptions: { formatString: '%B %Y' }       // April 2024
tickOptions: { formatString: '%Y-%m-%d' }    // 2024-04-08
tickOptions: { formatString: '%H:%M' }       // 14:30  (intraday)
```

`tickInterval` accepts human-readable strings: `'1 day'`, `'2 weeks'`,
`'1 month'`, `'6 hours'`, etc.

---

## Legal Notices

Copyright (c) 2009-2026 Chris Leonello

jqPlot is available under both the **MIT** and **GPL version 2.0** licenses.
Choose whichever best suits your project.

### Date instance methods

Author: Ken Snyder (ken d snyder at gmail dot com)
Date: 2008-09-10 · Version: 2.0.2
http://kendsnyder.com/sandbox/date/
License: Creative Commons Attribution License 3.0

### JavaScript printf/sprintf functions

Author: Ash Searle · Version: 2007.04.27
http://hexmen.com/blog/2007/03/printf-sprintf/
The author has placed this code in the public domain.
