# raf.xyz

This is my personal website.

## Gists

The `gists/` folder contains git submodules pointing to GitHub gists mentioned in posts.

### Making changes to a gist

```bash
cd gists/<name>
# edit files
git add .
git commit -m "your message"
git push
```

### Pulling updates from a gist

```bash
git submodule update --remote gists/<name>
```

### Adding a new gist

```bash
git submodule add git@gist.github.com:<gist_id>.git gists/<name>
```
