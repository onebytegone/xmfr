# xmfr (Transformer)

This is a node-based CLI tool to transform structured data into a more human consumable
format using templates.

## Examples

### Single JSON Object

```bash
$ cat single-item.json
{
   "animal": "Aardvark"
}
$ cat single-item.json | xmfr --print-context
{
   "record": { "animal": "Aardvark" },
   "records": [
      { "animal": "Aardvark" }
   ]
}
```

### Array of JSON Objects

```bash
$ cat array-of-items.json
[
   { "animal": "Aardvark" },
   { "animal": "Beaver" },
   { "animal": "Capybara" }
]
$ cat array-of-items.json | xmfr --print-context
{
   "record": { "animal": "Aardvark" },
   "records": [
      { "animal": "Aardvark" },
      { "animal": "Beaver" },
      { "animal": "Capybara" }
   ]
}
```

### Newline Delimited JSON Objects

```bash
$ cat newline-delimited-items.ndjson
{ "animal": "Aardvark" }
{ "animal": "Beaver" }
{ "animal": "Capybara" }
$ cat newline-delimited-items.ndjson | xmfr --print-context
{
   "record": { "animal": "Aardvark" },
   "records": [
      { "animal": "Aardvark" },
      { "animal": "Beaver" },
      { "animal": "Capybara" }
   ]
}
```

### Markdown with Front Matter

```bash
$ cat document.md
---
title: Animals
---
Aardvark Beaver Capybara
$ cat newline-delimited-items.ndjson | xmfr --print-context
{
   "record": { "title": "Animals", "body", "Aardvark Beaver Capybara" },
   "records": [
      { "title": "Animals", "body", "Aardvark Beaver Capybara" }
   ]
}
```

## Usage

### Options

   * `-t <path>` / `--template <path>`
   * `--print-context`
   * `--help`

### Creating Templates with AI (Experimental)

Writing handlebars templates manually can be cumbersome. Use the included prompt template
to have an AI agent generate templates for you:

   1. Copy the contents of `docs/xmfr-template-generator-prompt.md`
   2. Paste it into your AI agent conversation
   3. Describe your data structure and desired output format
   4. The agent will (hopefully) generate a properly structured handlebars template

The prompt template includes all xmfr-specific context, helpers, and patterns needed for
reliable template generation.

### Install/Upgrade

```bash
npm i -g 'git@github.com:onebytegone/xmfr.git'
```

## License

This software is released under the MIT license. See [the license file](LICENSE) for more
details.
