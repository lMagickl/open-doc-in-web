import {
  commands,
  env,
  ExtensionContext,
  Hover,
  languages,
  MarkdownString,
  Position,
  TextDocument,
  Uri,
  window,
  workspace,
} from "vscode";

export function activate(context: ExtensionContext) {
  let commandDisposable = commands.registerCommand(
    "open-doc-in-web.openInWEB",provideCommand
  );
  let hoverDisposable = languages.registerHoverProvider(
    { scheme: "file", language: "json" },
    { provideHover }
  );
  context.subscriptions.push(commandDisposable, hoverDisposable);
}

async function provideHover(document: TextDocument, position: Position) {
  const dependencyRegex = /"(?<name>[^"]+)":\s*"(?<version>[^"]+)"/g;
  const line = document.lineAt(position.line);
  const packageJson :string = workspace.getConfiguration().get('npm.packageJsonFilename') || 'package.json';
  const packageJsonUri = Uri.joinPath(Uri.file(workspace.workspaceFolders![0].uri.fsPath) || '', packageJson);
  const textDocument = await workspace.openTextDocument(packageJsonUri);
  const sectionRegex = /(dependencies|devDependencies|peerDependencies)/;
  
  // Vérifie si la ligne est dans une section "dependencies", "devDependencies" ou "peerDependencies" du fichier package.json
  for (let i = position.line; i >= 0; i--) {
    const currentLine = textDocument.lineAt(i).text.trim();
    const sectionMatch = sectionRegex.exec(currentLine);
    if (sectionMatch) {
      const section = sectionMatch[1];
      if (section === 'dependencies' || section === 'devDependencies' || section === 'peerDependencies') {
        const match = dependencyRegex.exec(line.text);
        if (match) {
          const packageName = match.groups!.name;
          const packageVersion = match.groups!.version;
          const link = `https://www.npmjs.com/package/${packageName}`;
          const content = new MarkdownString(`Link to the doc => ${link}`);
          return new Hover(content);
        }
      }
      break;
    }
  }
  
}

async function provideCommand(document: TextDocument, position: Position) {
  const languages = [
    {
      name: "Javascript",
      platforms: [
        { name: "npmjs", link: "https://www.npmjs.com/package/" },
        { name: "nuget", link: "https://www.nuget.org/packages?q=" },
      ],
    },
    {
      name: "PHP",
      platforms: [
        { name: "phpnet", link: "https://www.php.net/manual/en/function." },
      ],
    },
  ];

  const quickPicklanguage = window.createQuickPick();
  quickPicklanguage.title = "which language do you use ?";
  quickPicklanguage.placeholder = "choose a language";
  quickPicklanguage.items = languages.map((language) => ({
    label: language.name,
    value: language.name,
  }));
  quickPicklanguage.show();

  quickPicklanguage.onDidChangeSelection(([selected]) => {
    if (selected) {
      const quickPickPlatform = window.createQuickPick();
      quickPickPlatform.title = "which platform ?";
      quickPickPlatform.placeholder = "choose a platform name";

      const selectedLanguage = languages.find(
        (language) => language.name === selected.label
      );
      if (selectedLanguage) {
        quickPickPlatform.items = selectedLanguage.platforms.map(
          (platform) => ({
            label: platform.name,
            value: platform.name,
          })
        );
      }
      quickPickPlatform.show();
      quickPickPlatform.onDidChangeSelection(([selectedPlatform]) => {
        if (selectedPlatform) {
          (async () => {
            const userInput = await window.showInputBox({
              prompt: "tape a package name",
              value: "",
            });

            if (userInput) {
              let finalURL: string =
                languages
                  .find((language) => language.name === selectedLanguage!.name)!
                  .platforms.find(
                    (platform) => platform.name === selectedPlatform.label
                  )!.link + userInput;
              selectedPlatform.label === "phpnet"
                ? (finalURL += ".php")
                : finalURL;
              // Open the package URL in the user's default web browser
              env.openExternal(Uri.parse(finalURL));
            }
          })();
        }
      });
    }
  });
}
