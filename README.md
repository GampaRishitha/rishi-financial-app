# My Finance Tracker

A premium, responsive personal finance dashboard built with HTML5, CSS3, and JavaScript, leveraging LocalStorage for offline data persistence and Chart.js for data visualization.

## Features

- **Dashboard**: High-level widgets summarizing Total Savings, Spendings, Investments, and Losses, along with dual-trend area charts.
- **Submenus**:
  - **Purchases**: Table for non-negotiable monthly items (e.g. soap, shampoo) and their costs.
  - **Spendings**: Expense logs capturing what, why, when, and how much.
  - **Savings**: Records of monthly savings, reasoning behind savings drops, and annual goals.
  - **Investments**: Log of assets acquired, purchase dates, and amounts.
  - **Losses**: Tracker logging leak incidents and amounts.
- **Form Management**: Live validation and custom "Edit Mode" which updates records without deletion.
- **Responsive Layout**: Designed for mobile, tablet, and desktop screens with a slide-out navigation bar.

---

## Deploy to GitHub Pages (Step-by-Step)

Since this app is a client-side static application, you can host it **for free** on GitHub Pages in under a minute.

### Option A: Via GitHub Desktop (Easiest)

1. Open **GitHub Desktop** and select **File** > **New Repository**.
2. Name it `finance-tracker` and set the path to your folder.
3. Commit the files and click **Publish repository** to upload it to GitHub.
4. Go to your repository on github.com, click **Settings** > **Pages** (on the left menu).
5. Under **Build and deployment**, set the Source to **Deploy from a branch**.
6. Select the **main** (or `master`) branch and click **Save**.
7. In a few moments, GitHub will provide a link to your live app!

### Option B: Via Web Browser (No Git installation required)

1. Log in to [github.com](https://github.com/) and click the green **New** button to create a repository.
2. Name it `finance-tracker`, choose **Public**, and click **Create repository**.
3. In the repository page, click the **uploading an existing file** link.
4. Drag and drop `index.html`, `script.js`, `style.css`, and this `README.md` into the file area.
5. Click **Commit changes** at the bottom.
6. Go to **Settings** (top tabs) > **Pages** (left navigation sidebar).
7. Under **Branch**, select **main** (or `master`) and folder `/ (root)`. Click **Save**.
8. Wait 30 seconds, refresh the page, and click the link at the top of the Pages section to open your application!
