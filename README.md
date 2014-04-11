# Hubot: hubot-substitute 

[![Build Status](https://travis-ci.org/aaronstaves/hubot-substitute.svg?branch=master)](https://travis-ci.org/aaronstaves/hubot-substitute)

A regex find/replace watcher for Hubots

See [`src/substitute.coffee`](src/substitute.coffee) for full documentation.

## Installation

Add **hubot-substitute** to your `package.json` file:

```json
"dependencies": {
  "hubot": ">= 2.5.1",
  "hubot-scripts": ">= 2.4.2",
  "hubot-substitute": ">= 0.0.0",
  "hubot-hipchat": "~2.5.1-5",
}
```

Add **hubot-substitute** to your `external-scripts.json`:

```json
["hubot-substitute"]
```

Run `npm install hubot-substitute`

## Sample Interaction

```
aaron> I could really go for a beer right now
aaron> s/beer/stout beer/
Hubot> aaron: I could really go for a stout beer right now
```
```
aaron> I can't wait until we get their
aaron> s/their/there
Hubot> aaron: I can't wait until we get there
```
```
aaron> The cow goes woof woof
aaron> s/woo/moo/g
Hubot> aaron: The cow goes moof moof
```
```
aaron> The cow goes woof woof
guster> aaron s/woof/moo/g
Hubot> aaron: The cow goes moo moo
```
