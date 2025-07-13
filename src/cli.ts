import { program } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
import Handlebars from 'handlebars';
import marked from 'marked';
import fm from 'front-matter';
import path from 'path';
import { readFile } from 'fs/promises';

program
   .option('-t, --template <filename>', 'the template to render with', 'simple-list')
   .option('-v, --verbose', 'enable verbose debug logging')
   .option('--print-context', 'print the template context and quit');

program.parse();

const options = program.opts();

interface Logger {
   debug: (message: string) => void;
   errorAndQuit: (message: string) => never;
}

const logger: Logger = {

   debug: (message: string): void => {
      if (options.verbose) {
         process.stderr.write(chalk.gray('[DEBUG] ') + message + '\n');
      }
   },

   errorAndQuit: (message: string): never => {
      process.stderr.write(chalk.red('[ERROR] ') + message + '\n');
      process.exit(1); // eslint-disable-line no-process-exit
   },

};

enum InputParsingMode {
   FrontMatter = 'frontmatter',
   JSON = 'json',
}

async function readPipedInput(): Promise<unknown[] | undefined> {
   if (process.stdin.isTTY) {
      // Don't take stdin from terminal
      return;
   }

   const rl = readline.createInterface({ input: process.stdin, terminal: false });

   return new Promise((resolve) => {
      const objects: unknown[] = [];

      let buf = '',
          mode: InputParsingMode | undefined;

      rl.on('line', (line: string) => {
         if (!mode) {
            if (line === '---') {
               mode = InputParsingMode.FrontMatter;
            } else {
               mode = InputParsingMode.JSON;
            }
         }

         buf += line + '\n';

         // After each line, attempt to parse the buffer. This is what supports ndjson.
         // TODO: What's the perf impact of this?
         try {
            if (mode === InputParsingMode.JSON) {
               objects.push(JSON.parse(buf));
               buf = '';
            }
         } catch(e) {
            // noop
         }
      });

      rl.once('close', () => {
         if (buf) {
            if (mode === InputParsingMode.JSON) {
               objects.push(JSON.parse(buf));
            } else if (mode === InputParsingMode.FrontMatter) {
               // TODO: better type checking here?
               const { attributes, body } = fm<object>(buf);

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

async function readTemplate(nameOrFilePath: string): Promise<string> {
   const prebuiltTemplatePath = path.join(__dirname, '..', 'templates', `${nameOrFilePath}.hbs`),
         prebuiltTemplate = await readFile(prebuiltTemplatePath, 'utf-8').catch(() => { return undefined; });

   if (prebuiltTemplate) {
      return prebuiltTemplate;
   }

   return await readFile(nameOrFilePath, 'utf-8');
}

interface TemplateContext {
   record: unknown;
   records: unknown[];
}

(async (): Promise<void> => {
   logger.debug(`Arguments: ${JSON.stringify(program.args, undefined, 3)}`);
   logger.debug(`Options: ${JSON.stringify(options, undefined, 3)}`);

   const template = Handlebars.compile(await readTemplate(options.template)),
         stdinRecords = await readPipedInput();

   Handlebars.registerHelper('json', (context: unknown): string => {
      return JSON.stringify(context, undefined, 3);
   });

   Handlebars.registerHelper('length', (context: unknown[]): number => {
      return context.length;
   });

   Handlebars.registerHelper('stripTags', (context: string): string => {
      return context ? context.replace(/<[^>]*>?/gm, '') : context;
   });

   Handlebars.registerHelper('markdown', (context: string): unknown => {
      return new Handlebars.SafeString(marked.parse(context, {
         async: false,
      }));
   });

   if (!stdinRecords) {
      logger.errorAndQuit('No input was piped into stdin');
   }

   const templateContext: TemplateContext = {
      record: stdinRecords[0],
      records: stdinRecords,
   };

   if (options.printContext) {
      process.stdout.write(JSON.stringify(templateContext, undefined, 3) + '\n');
      process.exit(0); // eslint-disable-line no-process-exit
   }

   process.stdout.write(template(templateContext));
})();
