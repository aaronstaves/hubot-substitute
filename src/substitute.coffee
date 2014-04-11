# Description
#   When given a substitute regex, Hubot will repalce the given text
#
# Commands:
#   hubot <what did i say> - shows what hubot has stored for that user
#   <anything> - hubot will take note of what you said.  This is unique per name/room
#   <user>: s/find/replace/modifier - hubot will apply a regex to the last thing the user said and output the result
#   s/find/replace/modifier - hubot will apply a regex to the last thing you said and output the result
#
# Notes:
#   Rahzer> I could really go for a beer right now
#   Rahzer> s/beer/stout beer/
#   Hubot> Rahzer: I could really go for a stout beer right now
#   
#
# Author:
#   https://github.com/aaronstaves/

module.exports = (robot) ->

  # Stores last thing said by user, key is <user_id><room>
  lastSaid = {}
  subRegex = RegExp('^s/.+');

  #
  # listens to EVERYTHING
  #
  robot.hear /(.*)/, (msg) ->

    # Don't store any of the other commands
    if msg.match[1].match('what did i say')
      return
    if msg.match[1].match(subRegex)
      return

    # Go ahead and store what they said
    userRoomId = getUserRoomId(msg)
    if userRoomId
      lastSaid[userRoomId] = msg.match[1]

  #
  # listens to the regex s/find/replace/modifier
  #
  robot.hear /^s\/.+/, (msg) ->
  
    # grab the goodies
    regExpObj = getRegExpObj(msg.match[0])
    return if !regExpObj.isValid

    replace    = regExpObj.replace
    modifier   = regExpObj.modifier
    search     = RegExp(regExpObj.search, modifier)

    userRoomId = getUserRoomId(msg)

    # hubot has something in mind
    if userRoomId and lastSaid[userRoomId]

      username    = msg.message.user.name
      origText    = lastSaid[userRoomId]
      replaceText = origText.replace search, replace

      # nothing was replaced, regex didn't match
      if ( replaceText == origText ) 
        msg.send("#{username}: There is no substitute for trying")

      # display new text
      else
        # remove any (unintended?) trailing whitespace
        replaceText = replaceText.replace(/\s+$/, "")

        msg.send("#{username}: #{replaceText}")

  #
  # listens to the regex s/find/replace/modifier
  #
  robot.hear /([^\s]+?):*\s+s\/.+/, (msg) ->
  
    # grab user match
    user = robot.brain.userForName(msg.match[1])
    if !user 
      return
    userId = user.id  

    # grab the goodies
    regExpObj = getRegExpObj(msg.match[0].replace(/[^\s]+?:*\s+/, ""))
    return if !regExpObj.isValid

    replace    = regExpObj.replace
    modifier   = regExpObj.modifier
    search     = RegExp(regExpObj.search, modifier)

    userRoomId = userId+msg.message.room

    # hubot has something in mind
    if userRoomId and lastSaid[userRoomId]

      username    = msg.message.user.name
      origText    = lastSaid[userRoomId]
      replaceText = origText.replace search, replace

      # nothing was replaced, regex didn't match
      if ( replaceText == origText ) 
        msg.send("#{username}: There is no substitute for trying")

      # display new text
      else
        # remove any (unintended?) trailing whitespace
        replaceText = replaceText.replace(/\s+$/, "")

        msg.send("#{user.name}: #{replaceText}")

  #
  # Hubot what did i say - shows what hubot has stored
  # for the user that said it
  #
  robot.respond /what did i say/i, (msg) ->

    # get unique user/room id
    userRoomId = getUserRoomId(msg)

    if userRoomId and lastSaid[userRoomId]
      msg.send("You said: #{lastSaid[userRoomId]}")
    else
      msg.send("I have no idea what you said")


  # UTIL FUNCTIONS

  #
  #  getRegExpObj - Parses out a possible regex into a usable object
  #
  #  returns object
  # { 
  #   search : <search_regex>
  #   replace: <replace_str> - may be blank
  #   search : <modifier> - may be blank
  #   isValid: true - true if valid, false if invalid
  # }
  #
  getRegExpObj = (msg) ->

    # Remove preceting s/
    str = msg.replace(/^s\//,"")

    # object we're gonna return
    obj = 
      search: ''
      replace: ''
      modifier: ''
      isValid: false

    # initial 'mode' will be search
    mode = 'search'

    # initial string settings
    # blank previous and char was not escaped
    prev = ''
    escaped = false

    # loop through the string
    for i in [0..str.length-1]

      # set current char
      cur = str[i]

      # if previous char was escaped blindly accept it
      # and continue, be sure to clear escaped
      if escaped 
        escaped = false
        obj[mode] += cur
        prev = '' 
        continue

      # backslash, time to escape, add the
      # char and just continue
      if cur == "\\"
        escaped = true
        obj[mode] += cur
        continue

      # if it's a forward slash NOT prefixed by a backslash
      # means it's time to switch modes
      if cur == "/" and prev != "\\"

        # swap to the appropriate mode
        if mode == 'search'
          mode = 'replace'
          obj.isValid = true
        else if mode == 'replace'
          mode = 'modifier'
        else
          mode = 'unknown'

        # since we swapped modes, don't store the current char
        continue

      # store current char in whatever mode we're in
      obj[mode] += cur

      # reset previous and do it all over again
      prev = cur

    # Invalid situations
    # something in the modifier other than i, g or m
    if obj.modifier != '' and obj.modifier.match(/[^igm]/) 
      obj.isValid = false

    # No replace string defined AND no trailing /
    if mode == 'replace' and str[str.length-1] == '/'
      obj.isValid = false

    # return main obj
    return obj

  # UTIL FUNCTIONS

  #
  #  getUserRoomId - Get's the unique identifier we use for <user_id><room>
  #
  getUserRoomId = (msg) ->

    userRoomId = undefined

    # have a user, good to go
    if msg.message.user.id
      userRoomId = msg.message.user.id

      # have a room, add that to the identifier to make it
      # more unique
      if msg.message.room
        userRoomId += msg.message.room

    return userRoomId

