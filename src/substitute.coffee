# Description
#   When given a substitute regex, Hubot will repalce the given text
#
# Commands:
#   hubot <what did i say> - shows what hubot has stored for that user
#   <anything> - hubot will take note of what you said.  This is unique per name/room
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

  #
  # listens to EVERYTHING
  #
  robot.hear /(.*)/, (msg) ->

    # Don't store any of the other commands
    if msg.match[1].match('what did i say')
      return
    if msg.match[1].match(/^s\/([^\/]+)\/([^\/]+)\/*([^\/]+)*$/)
      return

    # Go ahead and store what they said
    userRoomId = getUserRoomId(msg)
    if userRoomId
      lastSaid[userRoomId] = msg.match[1]

  #
  # listens to the regex s/find/replace/modifier
  #
  robot.hear /^s\/([^\/]+)\/([^\/]+)\/*([^\/]+)*$/, (msg) ->
  
    # grab the goodies
    replace    = msg.match[2]
    modifier   = msg.match[3]
    search     = RegExp(msg.match[1], modifier)

    # check unique id for user/room
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
        msg.send("#{username}: #{replaceText}")
    # no record of anything the user said
    else
      msg.send("#{username}: I have no idea what you last said")


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

