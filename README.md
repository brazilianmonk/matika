# Abhidhamma Mātika Tester & Study Guide

An interactive testing and study platform for the **Abhidhamma Duka Mātikā** tables, featuring:
- Full Table Display of the 13 Duka Gocchakas (Hetu Gocchaka, Cūḷantara Duka, Āsava, Saṃyojana, Gantha, Ogha, Yoga, Kilesa, Piṭṭhi Duka, etc.)
- Progressive Auto-Reveal Memory Recall Drill
- Multiple-choice Quizzes with Abhidhamma explanations
- 3D Interactive Flashcards
- Fast Matching Drill
- JSON Dataset Explorer & In-app JSON Editor

---

## Deploying to GitHub Pages (`github.io`)

This project is pre-configured with a modern GitHub Actions workflow to build and host automatically on GitHub Pages.

### Step 1: Push code to your GitHub Repository
Push this codebase to your GitHub repository on branch `main` (or `master`):
```bash
git add .
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```

### Step 2: Enable GitHub Pages in your Repository Settings
1. Navigate to your repository on GitHub.
2. Click **Settings** (tab at the top).
3. In the left sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment** > **Source**, choose **GitHub Actions** from the dropdown menu.

### Step 3: View your Live Site
- Whenever you push changes to `main`, the workflow in `.github/workflows/deploy.yml` will automatically build the static site and deploy it.
- Your site will be live at:
  ```
  https://<your-username>.github.io/<your-repo-name>/
  ```

---

## Local Development & Static Build

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production static website (outputs to ./dist)
npm run build

# Preview static build locally
npm run preview
```
