# nripojyotibiswas.github.io

Research website of Nripojyoti Biswas, Ph.D., and the Biswas Geosystems Research Group at UMass Lowell.
Live at https://nripojyotibiswas.github.io

GitHub builds this site automatically every time a change is saved to the `main` branch.
It usually takes one to two minutes for a change to appear on the live site.

## How to update the site

You never need to edit the page design to change content. All content lives in the **`_data`** folder,
in simple text files ending in `.yml`. To edit one on GitHub:

1. Open the file on github.com and click the pencil icon (**Edit this file**).
2. Make your change, following the pattern of the entries around it.
3. Click **Commit changes**. The site updates in a minute or two.

| To change… | Edit this file |
|---|---|
| Publications (add a paper, mark one as featured) | `_data/publications.yml` |
| News items | `_data/news.yml` |
| Students and alumni | `_data/people.yml` |
| Courses (shown on the About the PI page) | `_data/courses.yml` |
| Appointments, education, honors | `_data/cv.yml` |
| Service, memberships, committees | `_data/service.yml` |
| Keynotes, webinars, workshops | `_data/talks.yml` |
| Funded projects | `_data/funding.yml` |
| Patent | `_data/patents.yml` |
| Field sites on the map | `_data/sites.yml` |
| Research theme text | `_data/themes.yml` |
| Home headline, group mission, name, email, links, citation numbers, Join Us text, "last updated" date | `_data/profile.yml` |

### Example: adding a journal article

Open `_data/publications.yml`, copy an existing journal entry, paste it near the top, and edit it:

```yaml
- type: journal
  year: 2027
  authors: Karbalaee, F., Biswas, N.
  title: Title of the new paper
  venue: Canadian Geotechnical Journal
  doi: "https://doi.org/10.xxxx/xxxxx"
```

The publication chart, filters and counts update by themselves.

### Example: adding a news item

Open `_data/news.yml` and add an entry at the top:

```yaml
- year: 2027
  category: Award
  title: Headline of the news item
  text: One short line of detail.
```

`category` can be Symposium, Award, Conference, Group, Workshop, Talk, Welcome or Teaching (it picks the icon).

### Tips

- **Spacing matters** in `.yml` files: keep each field indented with two spaces, exactly like the entries around it.
- If a line contains a colon (`:`), wrap the whole value in double quotes, as the `doi:` links are.
- If the site doesn't update after a change, open the **Actions** tab on GitHub. A red mark means GitHub
  couldn't read a file; the message usually names the file and line. Undo the last change and try again.

## What's where (for reference)

- `index.html`, `research.html`, `publications.html`, `group.html`, `news.html`, `about.html`: the pages (`teaching.html` only forwards old links to the Teaching section of About the PI)
- `_layouts/` and `_includes/`: shared page parts (head, menu, footer, map, illustrations)
- `assets/css/site.css`: all styling (colors and fonts are set at the top)
- `assets/js/site.js`: the interactive parts (hero animation, map, publication explorer, news rail)
