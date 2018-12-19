#!/usr/local/bin/node
const fs    = require('fs')
var xPath = './export'

var file = './'+process.argv[2]
//console.log(file)

if (fs.existsSync(file)) {
    var jBot = require(file)
    //console.log(jBot.slots)
    xPath+='/'+jBot.bot.name
    console.log(xPath+'/data/')
    //var mkdirRes = fs.mkdirSync(xPath+'/data/',{recursive: true})
    if ( !fs.existsSync(xPath) ){
        fs.mkdirSync(xPath)
    }
    if ( !fs.existsSync(xPath+'/data') ){
        fs.mkdirSync(xPath+'/data')
    }

    // writing domain.yml
    var stream = fs.createWriteStream(xPath+'/domain.yml')
    stream.once('open', function (fd) {

        stream.write("slots:\n")
        jBot.slots.forEach(slot => {
            stream.write("\t"+slot.name+":\n")
            stream.write("\t\ttype:"+slot.type+"\n")
        })

        stream.write("\nintents:\n")
        jBot.intents.forEach(intent => {
            stream.write("\t- "+intent.name+"\n")
        })

        stream.write("\nintents:\n")
        jBot.actions.forEach(action => {
            stream.write("\t- "+action.name+"\n")
        })

        stream.write("\templates:\n")
        jBot.templates.forEach(template => {
            stream.write("\t- "+template.name+"\n")
            stream.write("\t\t- "+template.text+"\n")
        })
        stream.end()
    })

    // writing NLU data
    var stream2 = fs.createWriteStream(xPath+'/nlu-training.md')
    stream2.once('open', function (fd) {
        jBot.intents.forEach(intent => {
            stream2.write("\n## intent:"+intent.name+"\n")
            intent.interpreter.forEach(data => {
                stream2.write("- "+data+"\n")
            })
        })
        stream2.end()
    })

    // writing Stories
    var stream3 = fs.createWriteStream(xPath+'/stories.md')
    stream3.once('open', function (fd) {
        jBot.intents.forEach(intent => {
            stream3.write("\n## "+intent.name+"\n")
            stream3.write("* "+intent.name+"\n")
            jBot.actions.forEach(action => {
                stream3.write("- "+action.name+"\n")
            })
        })
        stream3.end()
    })

    writeTrainerPy(xPath)

}

function writeTrainerPy(xPath){
    var pyTemplate=`
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

import argparse
import warnings

from rasa_nlu.training_data import load_data
from rasa_nlu import config
from rasa_nlu.model import Trainer

from rasa_core import utils
from rasa_core.agent import Agent
from rasa_core.policies.keras_policy import KerasPolicy
from rasa_core.policies.memoization import MemoizationPolicy


def train_nlu():
    training_data = load_data('data/nlu-data.md')
    trainer = Trainer(config.load("nlu-config.yml"))
    trainer.train(training_data)
    model_directory = trainer.persist('models/nlu/', fixed_model_name="current")
    return model_directory


def train_dialogue(
        domain_file="domain.yml",
        model_path="models/dialogue",
        training_data_file="data/stories.md"
        ):
    agent = Agent(
        domain_file,
        policies=[MemoizationPolicy(max_history=3), KerasPolicy()]
        )
    training_data = agent.load_data(training_data_file)
    agent.train(
        training_data,
        epochs=400,
        batch_size=100,
        validation_split=0.2
        )
    agent.persist(model_path)
    return agent


def train_all():
    model_directory = train_nlu()
    agent = train_dialogue()
    return [model_directory, agent]


if __name__ == '__main__':
    warnings.filterwarnings(action='ignore', category=DeprecationWarning)
    utils.configure_colored_logging(loglevel="INFO")

    parser = argparse.ArgumentParser(
            description='starts the bot training')

    parser.add_argument(
            'task',
            choices=["train-nlu", "train-dialogue", "train-all"],
            help="what the bot should do?")
    task = parser.parse_args().task

    # decide what to do based on first parameter of the script
    if task == "train-nlu":
        train_nlu()
    elif task == "train-dialogue":
        train_dialogue()
    elif task == "train-all":
train_all()
    `

    var fpy = fs.createWriteStream(xPath+'/data/trainer.py')
    fpy.once('open', function (fd) {
        fpy.write(pyTemplate)
        fpy.end()
    })
}