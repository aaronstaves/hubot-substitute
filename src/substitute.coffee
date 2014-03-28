# Description
#   When given a substitute regex, Hubot will repalce the given text
#
# Dependencies:
#   "<module name>": "<module version>"
#
# Configuration:
#   LIST_OF_ENV_VARS_TO_SET
#
# Commands:
#   hubot <trigger> - <what the respond trigger does>
#   <trigger> - <what the hear trigger does>
#
# Notes:
#   <optional notes required for the script>
#
# Author:
#   aaronstaves

module.exports = (robot) ->

  # Stores last thing said by user, key is <user_id><room>
  lastSaid = {}

  #
  # listens to EVERYTHING
  #
  robot.hear /(.*)/, (msg) ->

    # Don't actually wanna store the command
    if msg.match[1].match('what did i say')
      return
    if msg.match[1].match(/^s\/([^\/]+)\/([^\/]+)\/*([^\/]+)*$/)
      return

    # Go ahead and store what they said
    userRoomId = getUserRoomId(msg)
    if userRoomId
      lastSaid[userRoomId] = msg.match[1]

  robot.hear /^s\/([^\/]+)\/([^\/]+)\/*([^\/]+)*$/, (msg) ->
    replace = msg.match[2]
    modifier = msg.match[3]
    search = RegExp(msg.match[1], modifier)
    userRoomId = getUserRoomId(msg)

    if userRoomId and lastSaid[userRoomId]

      origText = lastSaid[userRoomId]
      replaceText = origText.replace search, replace
      if ( replaceText == origText ) 
        msg.send("#{msg.message.user.name}: There is no substitute for trying")
      else
        msg.send("#{msg.message.user.name}: #{replaceText}")
    else
      msg.send("#{msg.message.user.name}: I have no idea what you last said")


  #
  # Hubot what did i say - shows what hubot has stored
  # for the user that said it
  #
  robot.respond /what did i say/i, (msg) ->
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

    # Have a user, good to go
    if msg.message.user.id
      userRoomId = msg.message.user.id

      if msg.message.room
        userRoomId += msg.message.room

    return userRoomId

