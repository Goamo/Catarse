# Catarse
Catarse is a tool for quickly capturing your ideas, plans, and visual concepts. It’s designed specifically for designers and engineers who need to communicate their vision clearly—whether in client meetings or team discussions.

This open-source graphics editor allows you to create 2D illustrations with 3D support. Built on top of Three.js, it’s not meant to replace industry-standard professional tools—it serves a different, yet equally important purpose:

- Quickly sketching out ideas and concepts while they’re still fresh

- Providing visual support during live discussions and meetings

- Adding spatial depth through basic 3D perspective

- Experimenting with layouts and compositions in a lightweight, distraction-free environment

- Supporting fast, iterative workflows without unnecessary complexity

- Saving the outcomes of discussions, webinars, or workshops as raster images (e.g., PNG)



The current stable version is 1.0, featuring the core functionality:

1) Interaction with 3D primitives: add, move, scale, rotate, and delete

2) Drawing with basic brushes across different planes, depending on the selected mode

3) Layer management with the ability to hide or delete layers

4) Automatic counting and logging of objects placed on the canvas


As Catarse is still in its early stages, some bugs or unexpected behavior may occur. If you encounter any issues, don’t worry — simply report the problem in a clear and accessible way, and we’ll do our best to address it in future updates.

Online version:
https://goamo.github.io/catarse-official/

Offline version (source code):
https://github.com/Goamo/Catarse


# Installation Guide

1. **Download** the version of the program you need.

2. **Unzip** the archive to your Desktop.

3. In parallel, do the following:

   3.1) **Install Visual Studio Code**
   3.2) In VS Code, find the **Extensions** tab on the left panel
   3.3) Search for **Live Server** and install it

4. **Open**:

#### 4.1 Windows PowerShell — depending on your browser, use one of the following commands:

**Google Chrome**:

```powershell
& "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\chrome-dev" "file:///C:/Users/Your%20Username/Desktop/your_version/Draw/index.html"
```

**Microsoft Edge**:

```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --disable-web-security --user-data-dir="C:\edge-dev" "file:///C:/Users/Your%20Username/Desktop/your_version/Draw/index.html"
```

#### 4.2 macOS Terminal (alternative):

**Google Chrome**:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --disable-web-security --user-data-dir="/tmp/chrome-dev" "file:///Users/Your%20Username/Desktop/your_version/Draw/index.html"
```

**Microsoft Edge**:

```bash
"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" --disable-web-security --user-data-dir="/tmp/edge-dev" "file:///Users/Your%20Username/Desktop/your_version/Draw/index.html"
```

5. **Done!**
   You can now start working with Catarse locally.


