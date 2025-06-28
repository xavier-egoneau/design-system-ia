# Project Documentation

## Overview
This project is structured to manage and process assets for a web application. It includes tasks for handling images, JavaScript, and SCSS files, ensuring that all processed outputs are organized in a designated public directory.

## Directory Structure
- **assets/**: Contains source files for the project.
  - **img/**: Directory for image files to be processed.
  - **js/**: Directory for JavaScript files to be processed.
  - **scss/**: Directory for SCSS files to be compiled into CSS.
  
- **public/**: Contains the output of processed files.
  - **assets/**: Directory where all processed assets are stored.

- **tasks/**: Contains Gulp tasks for processing assets.
  - **css.js**: Gulp task for compiling SCSS files into CSS.
  - **images.js**: Gulp task for processing image files.
  - **javascript.js**: Gulp task for processing JavaScript files.

## Gulp Tasks
- **CSS Task**: Compiles SCSS files from the `assets/scss` directory and outputs the resulting CSS files to the `public/assets` directory.
- **Images Task**: Processes image files from the `assets/img` directory and outputs them to the `public/assets` directory.
- **JavaScript Task**: Processes JavaScript files from the `assets/js` directory and outputs them to the `public/assets` directory.

## Installation
To get started with this project, ensure you have Node.js installed. Then, run the following command to install the necessary dependencies:

```
npm install
```

## Usage
To run the Gulp tasks, use the following command:

```
gulp
```

This will execute all defined tasks and process the assets accordingly.