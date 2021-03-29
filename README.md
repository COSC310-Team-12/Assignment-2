The following repository contains the different elements of the chatbot ParlAI.

The following files contain all the necessary files needed to run the Chatbot ParlAI on your own local system, each file containing the necessary information. It should be noted that we've modified some components of the ParlAI in order to meet the requirements of the assignment

Belown, in this README file can be found the link toward the project management tool used during the assignment: https://trello.com/b/Vz3vdK6Z/assignment-2 
In total 9 tickets have been created. All of them with a particular element of the assignment (such as develpment, peer reviewing, and others).
Each tickets specified the team member(s) mainly repsonsible in completing the task. However, it must be taken into account that if help was required, all team members could participate. 

**Features**

- Modern GUI
- Board topics
- Convincing responses outside of topics
- Spelling mistake handling
- Sentiment analysis - The bot utilizes sentiment analysis to give a more positive response.
- POS tagging - The bot extracts common adverbs and adjectives from user's input and passes it to our synonym recognition system.
- Synonym recongnition - The bot replaces complex adjectives and adverbs with common adjectives and adverbs, greatly improves the bot's accuracy.

**Testing**

The unit testing for this project was done using Jasmine for Node.js, given that most of the processing was performed by JS scripts. The necessary files to run the Unit Testing can be found the /spec and /lib directory. To run the tests on your local system, load the files on your IDE then run the following code on your terminal:

> jasmine spec/testBot.js

This should work if all the necessary libraries and directories are properly downloaded and stored in the right directories. The actual test can be found in /spec/testbot.js, where all the tests have the necesary information needed to run it. It should be noted that the /lib directory contains some duplicated .js files that have minor changes in order to actually test the methods.

All methods tested are very important and necessary for correct running of the Chatbot.
