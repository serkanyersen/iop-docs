# ifvisible.js

![npm](https://img.shields.io/npm/v/ifvisible.js)
![license](https://img.shields.io/github/license/user/repo)
![build](https://img.shields.io/github/workflow/status/user/repo/build)

> A lightweight, cross-browser, dependency-free library to check if the current page is visible or if the user is idle.

---

## Installation

```bash
npm install ifvisible.js
```

Or usage via CDN / Script tag (sets global `ifvisible`):

```html
<script src="path/to/ifvisible.js"></script>
```

## Usage Examples

### Check Status

Check if the page is currently active and visible to the user:

```javascript
if (ifvisible.now()) {
    console.log("User is active");
}
```

### Event Listeners

Subscribe to visibility and status changes:

```javascript
// Function to handle pauses (e.g. video)
ifvisible.on('idle', function(){
    console.log("User has gone idle");
    video.pause();
});

// Function to handle resume
ifvisible.on('wakeup', function(){
    console.log("User is back!");
    video.play();
});

ifvisible.on('blur', () => {
    console.log("User switched tabs or minimized window");
});

ifvisible.on('focus', () => {
    console.log("User focused the window");
});
```

### Smart Intervals

Run a task every X seconds, but **only** when the user is active on the page.

```javascript
// Run animation every 0.5 seconds
ifvisible.onEvery(0.5, () => {
    animateLogo();
});
// The animation automatically pauses when user idles or switches tabs!
```

## API Reference

- **`ifvisible.setIdleDuration(seconds)`**: Set the inactivity time before triggering 'idle' (default: 60s).
- **`ifvisible.now()`**: Returns `true` if page is visible.
- **`ifvisible.on(event, callback)`**: Listen to `idle`, `wakeup`, `blur`, `focus`.
- **`ifvisible.off(event, callback)`**: Remove listener.
- **`ifvisible.idle()`**: Manually trigger idle state.
- **`ifvisible.wakeup()`**: Manually trigger active state.

## License

MIT License.

---

> [!NOTE]
> This project is maintained using **Intent-Oriented Programming (IOP)**.
