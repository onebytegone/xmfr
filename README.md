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
$ cat single-item.json | xfmr --print-context
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
$ cat array-of-items.json | xfmr --print-context
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
$ cat newline-delimited-items.ndjson | xfmr --print-context
{
   "record": { "animal": "Aardvark" },
   "records": [
      { "animal": "Aardvark" },
      { "animal": "Beaver" },
      { "animal": "Capybara" }
   ]
}
```

## Options

   * `-t <path>` / `--template <path>`
   * `--print-context`
   * `--help`

## License

This software is released under the MIT license. See [the license file](LICENSE) for more
details.
