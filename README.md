This is a MEAN stack project using Yeoman and the angular-fullstack generator for scaffolding.

In order to run the program, make sure you have the following programs installed and depending on your computer:

MongoDB from http://www.mongodb.org/
Node.js from http://nodejs.org/
Ruby from https://www.ruby-lang.org/en/

Note: Ruby and a gem depencency SASS must be installed and in your PATH for the project to compile correctly.

For MAC OSX Users:

Use Homebrew to install these missing packages. Instructions are as follows:

To install Homebrew:
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
brew doctor

To install ruby:
brew install ruby

To install SASS:
Navigate to where you installed ruby (mine was /usr/local/Cellar/ruby/<Your version>) and do:
gem install sass 

From there, navigate back to the home directory of the project and type in grunt serve. The application should load from there.

Useful Notes:
For deleting node_modules folder on Windows (*Do this in command prompt): "mkdir junk" and then "robocopy junk node_modules /MIR"
