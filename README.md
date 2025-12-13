# xmfr (Transformer)

This is a node-based CLI tool to transform structured data into a more human consumable
format using templates.

## Examples

### Basic Usage

Transform JSON data into HTML using built-in templates:

```bash
# Use the simple-list template (default)
$ echo '{"name": "John", "age": 30}' | xmfr
```

### Data Structure Examples

xmfr normalizes all input into a consistent structure with `record` (first item) and
`records` (all items):

#### Single JSON Object

```bash
$ echo '{"animal": "Aardvark"}' | xmfr --print-context
{
   "record": { "animal": "Aardvark" },
   "records": [ { "animal": "Aardvark" } ]
}
```

#### Array of Objects (treated as single record)

```bash
$ echo '[{"name": "Alice"}, {"name": "Bob"}]' | xmfr --print-context
{
   "record": [ {"name": "Alice"}, {"name": "Bob"} ],
   "records": [ [ {"name": "Alice"}, {"name": "Bob"} ] ]
}
```

#### Newline Delimited JSON

```bash
$ cat data.ndjson
{"name": "Alice", "age": 25}
{"name": "Bob", "age": 30}

$ cat data.ndjson | xmfr --print-context
{
   "record": { "name": "Alice", "age": 25 },
   "records": [
      { "name": "Alice", "age": 25 },
      { "name": "Bob", "age": 30 }
   ]
}
```

### Transformation Examples

#### People Directory

**Input data (people.ndjson):**

```json
{"name": "Alice Smith", "email": "alice@example.com", "age": 28}
{"name": "Bob Jones", "email": "bob@example.com", "age": 32}
```

**Template (people-cards.hbs):**

```handlebars
<!DOCTYPE html>
<html>
<head>
   <title>People Directory</title>
   <style>{{rawFileContents 'node_modules/simpledotcss/simple.min.css'}}</style>
</head>
<body>
   <h1>People Directory ({{length records}} people)</h1>
   <div class="cards">
   {{#each records}}
      <div class="card">
         <h3>{{this.name}}</h3>
         <p>Email: {{this.email}}</p>
         <p>Age: {{this.age}}</p>
      </div>
   {{/each}}
   </div>
</body>
</html>
```

**Command:**

```bash
cat people.ndjson | xmfr -t people-cards.hbs > directory.html
```

**Output:**

```html
<!DOCTYPE html>
<html>
<head>
   <title>People Directory</title>
   <style>/* Simple.css styles included */</style>
</head>
<body>
   <h1>People Directory (2 people)</h1>
   <div class="cards">
      <div class="card">
         <h3>Alice Smith</h3>
         <p>Email: alice@example.com</p>
         <p>Age: 28</p>
      </div>
      <div class="card">
         <h3>Bob Jones</h3>
         <p>Email: bob@example.com</p>
         <p>Age: 32</p>
      </div>
   </div>
</body>
</html>
```

#### Markdown Blog Posts

**Input (posts.ndjson):**

```json
{"title": "Hello World", "date": "2024-01-01", "content": "# Welcome\n\nThis is my first post."}
{"title": "Second Post", "date": "2024-01-02", "content": "## Update\n\nHere's another post."}
```

**Template (blog.hbs):**

```handlebars
<!DOCTYPE html>
<html>
<head>
   <title>My Blog</title>
   <style>{{rawFileContents 'node_modules/@picocss/pico/css/pico.fluid.classless.slate.min.css'}}</style>
</head>
<body>
   <main>
      <h1>My Blog</h1>
      {{#each records}}
         <article>
            <header>
               <h2>{{this.title}}</h2>
               <time>{{this.date}}</time>
            </header>
            {{markdown this.content}}
         </article>
      {{/each}}
   </main>
</body>
</html>
```

**Command:**

```bash
cat posts.ndjson | xmfr -t blog.hbs > blog.html
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
