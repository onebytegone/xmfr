#!/usr/bin/env node

'use strict';

const { program } = require('commander'),
      chalk = require('chalk'),
      readline = require('readline'),
      Handlebars = require('handlebars'),
      marked = require('marked'),
      fm = require('front-matter'),
      fs = require('fs'),
      path = require('path');

program
   .option('-t, --template <filename>', 'the template to render with', 'simple-list')
   .option('-v, --verbose', 'enable verbose debug logging')
   .option('--print-context', 'print the template context and quit');

program.parse();

const options = program.opts();

const logger = {

   debug: (message) => {
      if (options.verbose) {
         process.stderr.write(chalk.gray('[DEBUG] ') + message + '\n');
      }
   },

   errorAndQuit: (message) => {
      process.stderr.write(chalk.red('[ERROR] ') + message + '\n');
      process.exit(1); // eslint-disable-line no-process-exit
   },

};

async function readPipedInput() {
   if (process.stdin.isTTY) {
      // Don't take stdin from terminal
      return;
   }

   const rl = readline.createInterface({ input: process.stdin, terminal: false });

   return new Promise((resolve) => {
      const objects = [];

      let buf = '',
          mode;

      rl.on('line', (line) => {
         if (!mode) {
            if (line === '---') {
               mode = 'frontmatter';
            } else {
               mode = 'json';
            }
         }

         buf += line + '\n';

         // After each line, attempt to parse the buffer. This is what supports ndjson.
         // TODO: What's the perf impact of this?
         try {
            if (mode === 'json') {
               objects.push(JSON.parse(buf));
               buf = '';
            }
         } catch(e) {
            // noop
         }
      });

      rl.once('close', () => {
         if (buf) {
            if (mode === 'json') {
               objects.push(JSON.parse(buf));
            } else if (mode === 'frontmatter') {
               const { attributes, body } = fm(buf);

               objects.push({
                  ...attributes,
                  body,
               });
            }
         }

         resolve(objects);
      });
   });
}

async function readTemplate(nameOrFilePath) {
   const prebuiltTemplatePath = path.join(__dirname, '..', 'templates', `${nameOrFilePath}.hbs`),
         prebuiltTemplate = await fs.promises.readFile(prebuiltTemplatePath, 'utf-8').catch(() => { return undefined; });

   if (prebuiltTemplate) {
      return prebuiltTemplate;
   }

   return await fs.promises.readFile(nameOrFilePath, 'utf-8');
}

(async () => {
   logger.debug(`Arguments: ${JSON.stringify(program.args, undefined, 3)}`);
   logger.debug(`Options: ${JSON.stringify(options, undefined, 3)}`);

   const template = Handlebars.compile(await readTemplate(options.template)),
         stdinRecords = await readPipedInput();

   Handlebars.registerHelper('json', (context) => {
      return JSON.stringify(context, undefined, 3);
   });

   Handlebars.registerHelper('length', (context) => {
      return context.length;
   });

   Handlebars.registerHelper('stripTags', (context) => {
      return context ? context.replace(/<[^>]*>?/gm, '') : context;
   });

   Handlebars.registerHelper('markdown', (context) => {
      return new Handlebars.SafeString(marked.parse(context));
   });

   if (!stdinRecords) {
      logger.errorAndQuit('No input was piped into stdin');
   }

   const templateContext = {
      record: stdinRecords[0],
      records: stdinRecords,
   };

   if (options.printContext) {
      process.stdout.write(JSON.stringify(templateContext, undefined, 3) + '\n');
      process.exit(0); // eslint-disable-line no-process-exit
   }

   process.stdout.write(template(templateContext));
})();
