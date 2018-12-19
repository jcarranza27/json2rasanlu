# json2rasanlu
### Nodejs tool to convert a json input file to RasaNLU template files
* domain.yml
* stories.md
* nlu_config.yml
* nlu_training.md
* nlu_model_training.py


# Install
```
git clone https://gitlab.com/dev4telco/json2rasanlu.git
npm install
``` 


# Run
```
./json2rasanlu.js sample.json
```

# Rasa NLU Files
### Find your Rasa NLU bot files under export/{BOT_NAME}/ directory
## Example:
```
> find export/
export/TimeBot
export/TimeBot/nlu-training.md
export/TimeBot/stories.md
export/TimeBot/domain.yml
export/TimeBot/data
export/TimeBot/data/trainer.py
```

# Dependencies
- node > v10.7 (tested)

# Todo
* Support multiple python templates
* Better Rasa language support
* Bot.py generation
* Fix actions support for stories (change json structure needed)

# License
<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Free without any warranty</a>.