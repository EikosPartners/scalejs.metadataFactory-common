# Boilerplate code for an ES6 package

### Converting existing code to an ES6 Package

1. First run ```npm init``` to create a package.json and follow the prompts
2. Next you will need to add the dependencies from the bower.json file into your package.json
    * You can do this via ```npm install --save package-name``` or ```--save-dev``` if it is a dev dependency
    * You will need to install ```babel-cli``` and ```babel-preset-es2015``` as dev dependencies
2. Next move all of your source code into a folder called ```src```
3. If you are converting AMD code into ES6, install the tool [amdtoes6](https://github.com/jonbretman/amd-to-as6)
    * ```npm install -g amd-to-es6```
    * Convert the code in your src folder via ```amdtoes6 --dir src/ --out src/```
4. Add a script to your package.json called ```build```, the same as in this repo's package.json
5. ```npm run build``` to use babel to transpile your code from es6 back to es5

### Creating a brand new extension
1. Download this repo, copy the package.json and .gitignore and then edit some fields on the package.json
    * ```name```: Change to the name of your extension
    * ```decsription```: Change to a description of your project
    * ```main```: This will be the entry point of your module. Change to ```dist/name-of-your-source-code.js```
    * ```repository```: Append the ```repo-name.git``` to ```url```
    * ```author```: Add yourself as the author, in the format ```First Last <email@domain.com>```
    * ```bugs```: Append ```repo-name/issues``` to the ```url```
    * ```homepage```: Append the repo's name to the ```url```
2. Add your dependencies via ```npm install --save package-name```
3. When you are ready to distribute, ```npm run build``` will transpile the ES6 code into es5 via babel

### Including your package in a project's package.json
Add the following as a dependency of your project. The name must match what is in the ```name``` field of your extension's package.json
```
{
    "name-of-your-package": "git+url-of-your-repo"
}```