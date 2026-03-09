FocuzStreak - AI Focus Monitor 🦁

FocuzStreak is an innovative browser extension that uses AI-powered eye tracking to help you maintain focus during work or study sessions. It gamifies the focus-tracking experience with a cute pixel lion companion!

🌟 Features

- Real-time Eye Tracking: Advanced AI-powered gaze detection using TensorFlow.js and WebGazer
- Focus Monitoring: Get instant alerts when you look away from your screen
- Focus Statistics: Track your focus metrics and improvement over time
- Gamification: Earn points for staying focused and customize your lion companion
- Pixel Perfect Design: Retro-styled UI with modern functionality
- Cross-browser Support: Works on Chrome, Firefox, and Edge

🚀 How to install

1. Clone the repository:
```bash
git clone https://github.com/Kum023/FocuzStreak.git
cd FocuzStreak
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build the extension:
```bash
npm run build:extension
```

5. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions`
   - Turn **Developer mode** on (top-right toggle)
   - Click **Load unpacked**
   - Choose the **`dist`** folder inside the project (the one that contains `manifest.json`, `index.html`, `content.js`, `icon.png`)
   - The FocuzStreak icon should appear in the toolbar; click it to open the popup.

**To run it again after code changes:** run `npm run build:extension` again, then go to `chrome://extensions` and click the refresh icon on the FocuzStreak card.

## 🌐 Use it directly (live)

**Anyone can use FocuzStreak in the browser — no install needed.**

👉 **Live app:** [https://kum023.github.io/FocuzStreak/](https://kum023.github.io/FocuzStreak/)

1. Open the link (Chrome or Edge recommended; allow camera when prompted).
2. Wait for the model to load, then click **Start Monitoring**.
3. Calibrate if asked, then keep your face in frame to track focus.

The site deploys automatically when changes are pushed to `main`.

Tech Stack

- React + TypeScript
- Tailwind CSS
- WebGazer.js
- TensorFlow.js Face Mesh
- Vite
- Lucide Icons

How It Works

1. Enable Camera: Grant camera access for eye tracking
2. Start Monitoring: Click the "Start Monitoring" button
3. Stay Focused: Get alerts if you look away from the screen
4. Earn Points: Get 10 points per minute of focus time
5. Customize: Use points to buy hats for your lion companion

🏆 Features That Wow

- Pixel Lion Companion: A cute mascot that reacts to your focus state
- Focus Points System: Gamified approach to maintaining attention
- Customizable Alerts: Visual and audio notifications
- Detailed Analytics: Track your focus patterns and improvements
- Overlay Mode: Floating window that works with any application

👥 Author

- [Kumara] - [Full Stack Developer & Designer]

🎯 Motivation

Created to address the growing challenge of maintaining focus in our digital age, FocuzStreak combines cutting-edge AI technology with gamification to make focus tracking fun and engaging.

🔮 Future Plans

- Mobile app version
- Focus leaderboards
- More customization options
- Focus streak rewards
- Chrome Extension
