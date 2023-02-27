import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "open-doc-in-web.openInWEB",
    () => {
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

      const quickPicklanguage = vscode.window.createQuickPick();
      quickPicklanguage.title = "which language do you use ?";
      quickPicklanguage.placeholder = "choose a language";
      quickPicklanguage.items = languages.map((language) => ({
        label: language.name,
        value: language.name,
      }));
      quickPicklanguage.show();

      quickPicklanguage.onDidChangeSelection(([selected]) => {
        if (selected) {
          const quickPickPlatform = vscode.window.createQuickPick();
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
                const userInput = await vscode.window.showInputBox({
                  prompt: "tape a package name",
                  value: "",
                });

                if (userInput) {
                  let finalURL: string =
                    languages
                      .find(
                        (language) => language.name === selectedLanguage!.name
                      )!
                      .platforms.find(
                        (platform) => platform.name === selectedPlatform.label
                      )!.link + userInput;
											(selectedPlatform.label === 'phpnet') ? finalURL += '.php' : finalURL;
                  // Open the package URL in the user's default web browser
                  vscode.env.openExternal(vscode.Uri.parse(finalURL));
                }
              })();
            }
          });
        }
      });
    }
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}
