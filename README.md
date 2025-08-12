# NE2NE Site Monitor

A web-based site monitoring dashboard that tracks website uptime and displays historical status data.

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.x) or any static file server
- **Git** for cloning the repository

### Step 1: Clone the Repository
```bash
git clone [your-repo-url]
cd [repo-name]
```

### Step 2: Install Dependencies
```bash
npm install
```
This will install Cypress and all other testing dependencies.

### Step 3: Run the Application

#### Option A: Using Python (Recommended)
```bash
python -m http.server 8000
```

#### Option B: Using Node.js
```bash
# If you don't have http-server installed globally
npm install -g http-server

# Run the server
http-server -p 8000
```

#### Option C: Using VS Code Live Server
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. Update Cypress config to use the correct port (usually 5500)

### Step 4: Access the Application
Open your browser and navigate to:
```
http://localhost:8000
```

You should see the NE2NE Site Monitor with two default sites (google.com and example.com).

## 🧪 Running Cypress Tests

### Option 1: Interactive Mode (Recommended for Development)
```bash
npx cypress open
```
1. Select "E2E Testing"
2. Choose a browser (Chrome, Edge, Electron, or Firefox)
3. Click on any test file to run it
4. Watch the tests execute in real-time

### Option 2: Headless Mode (Recommended for CI/Quick Checks)
```bash
# Run all tests
npx cypress run

# Run a specific test file
npx cypress run --spec cypress/e2e/site-monitor-basic.cy.js
```

### Important: Running Tests
⚠️ **The application must be running on localhost:8000 before running tests!**

**Recommended approach - Use two terminal windows:**
- Terminal 1: Run the server (`python -m http.server 8000`)
- Terminal 2: Run Cypress tests (`npx cypress open`)

## 📁 Project Structure
```
project-root/
├── index.html          # Main HTML file
├── styles.css          # Styling
├── script.js           # Application logic
├── package.json        # Node dependencies
├── cypress.config.js   # Cypress configuration
├── cypress/
│   ├── e2e/           # Test files
│   │   └── *.cy.js    # Individual test specs
│   ├── fixtures/       # Test data
│   └── support/        # Support files
└── node_modules/       # Dependencies (git-ignored)
```

## 🎯 Features
- **Add/Remove Sites**: Monitor any website by adding its URL
- **Real-time Status**: Checks site availability every 20 seconds
- **Visual Indicators**: Green for online, red for offline
- **Historical Data**: 24-hour uptime history stored in browser localStorage
- **Charts**: Visual representation of uptime history
- **Responsive Design**: Works on desktop and mobile devices

## 🐛 Troubleshooting

### "npm: command not found"
- Install Node.js from https://nodejs.org/
- After installation, restart your terminal

### "Cannot GET /" error
- Make sure you're in the correct directory when starting the server
- Verify `index.html` exists in the current directory

### Cypress won't start
```bash
# Clear Cypress cache and reinstall
npx cypress cache clear
npm install --save-dev cypress
```

### All sites showing as "Online" even when they're not
- This is a known limitation due to browser CORS policies
- The `no-cors` mode in fetch always succeeds for the request itself
- Consider implementing a backend proxy for accurate status checking

### Tests failing with "Connection refused"
- Ensure the application is running on http://localhost:8000
- Check that no firewall is blocking port 8000

## 📝 Adding New Tests

Create new test files in `cypress/e2e/` with the `.cy.js` extension:

```javascript
describe('Your Test Suite', () => {
  it('should do something', () => {
    cy.visit('http://localhost:8000');
    // Add your test assertions here
  });
});
```

## 🔧 Configuration

### Changing the Port
If port 8000 is unavailable:

1. Run the server on a different port:
   ```bash
   python -m http.server 3000
   ```

2. Update `cypress.config.js`:
   ```javascript
   baseUrl: 'http://localhost:3000'
   ```

### Cypress Settings
Edit `cypress.config.js` to modify:
- Viewport dimensions
- Timeouts
- Video recording
- Screenshot settings
- Test file patterns

## 💡 Tips for Contributors

1. **Pull latest changes before starting work**
   ```bash
   git pull origin main
   ```

2. **Install dependencies after pulling**
   ```bash
   npm install
   ```

3. **Run tests before pushing**
   ```bash
   npm test  # If configured
   # or
   npx cypress run
   ```

4. **Create feature branches**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📚 Additional Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## 🤝 Need Help?

If you encounter any issues:
1. Check the Troubleshooting section above
2. Ensure all prerequisites are installed
3. Try clearing browser cache and localStorage
4. Reach out to the team

---

**Happy Testing! 🎉**
