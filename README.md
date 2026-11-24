<p align="center"><img src=".github/repository-banner.svg" alt="Janani B — Portfolio — Curiosity, code, and possibility" width="100%" /></p>

<p align="center"><a href="https://github.com/Janani-Balasubramanian">GitHub profile</a> · <a href="https://janani-balasubramanian.github.io/portfolio/">Live portfolio</a> · <a href="https://github.com/Janani-Balasubramanian/portfolio/issues">Issues</a></p>

# Janani B — Portfolio

A responsive portfolio for Janani B, a pre-final-year Computer Science and Business Systems student at Rajalakshmi Institute of Technology, Chennai.

## Features

- Space-inspired design with animated stars and interactive particle formations
- Interactive Orbit, Wave, and Galaxy particle formations
- Expandable project descriptions, education, skills, and experience
- Downloadable updated résumé
- Motion pause control and reduced-motion support

## Run locally

The site uses plain HTML, CSS, and JavaScript. No build or installation is required.

```sh
python -m http.server 4173
```

Open http://localhost:4173 in your browser. You can also open `index.html` directly. Fonts are included locally with their open-source licenses; no external font service is required.

## Files

- `index.html` — portfolio content
- `style.css` — layout, colors, and animation styling
- `app.js` — particle interactions and navigation behavior
- `Janani_B_Resume.pdf` — downloadable résumé

Upload the HTML, CSS, JavaScript, and PDF files to a static web host to serve the website.

## Keeping this address working

Stable public address: https://janani-balasubramanian.github.io/portfolio/

Keep the GitHub account and the public `portfolio` repository, and leave Pages enabled with GitHub Actions as its source. Renaming the account or repository changes the address. Deleting the repository or disabling Pages takes the site offline; the custom 404 page cannot prevent those cases. There is no paid domain to renew and no API key, database, server process, or package installation required to view this site.

Before every deployment, the workflow checks JavaScript syntax, local assets, section anchors, fonts, and the PDF. Failed checks prevent the new version from being deployed. These checks reduce regressions; they do not prove that every browser interaction is bug-free. GitHub Actions or hosting policies can change and may eventually require maintenance.

## Backup and recovery

Run `python scripts/validate.py` to validate and assemble `dist/`. Copy the entire contents of `dist/` to any static host to restore the website, including all fonts and the resume. It also opens locally from `dist/index.html`. Keep an additional backup outside this computer and GitHub.

To restore an earlier version, revert the problematic commit and push to main, or use the Actions tab to run the publishing workflow again. Do not delete the repository to undo a change. For a missing repository, restore from the Git bundle backup into a new repository named `portfolio` under the same account, then enable GitHub Pages with GitHub Actions.

A mistyped URL displays `404.html` with links back to the portfolio and GitHub profile. Hosting outages, account restrictions, repository deletion, and future platform changes remain outside this website's control.
## Ask Janani assistant

The floating Ask Janani button opens a live AI guide to this public portfolio. It uses a separate Sites-hosted Gemini endpoint; the API key is never shipped in these files. The assistant is instructed to answer only from a snapshot of the portfolio and to decline unrelated questions or unknown details. AI answers may still be inaccurate.

Questions and up to six recent chat messages are sent to Google Gemini through the server. The frontend keeps chat in memory only. The core site, resume, and navigation remain usable when chat is offline. API quotas and provider availability affect the chat independently of GitHub Pages.

When updating portfolio facts, also update the chat server's `worker/profile.json` in the local `janani-portfolio-chat` project and republish that server. The frontend endpoint is configured in `assets/chat.js`. No scheduled monitoring has been configured.
