var expect = require("chai").expect;
var path   = require("path");

var Robot       = require("hubot/src/robot");
var TextMessage = require("hubot/src/message").TextMessage;


describe("Hubot-Substitute Functionality", function() {
    var robot;
    var user;
    var adapter;

    beforeEach(function(done) {
        // create new robot, without http, using the mock adapter
        robot = new Robot(null, "mock-adapter", false, "TestBot");

        robot.adapter.on("connected", function() {
            // only load scripts we absolutely need, like auth.coffee
            process.env.HUBOT_AUTH_ADMIN = "1";
            robot.loadFile(
                path.resolve(
                    path.join("node_modules/hubot/src/scripts")
                ),
                "auth.coffee"
            );

            // load the module under test and configure it for the
            // robot.  This is in place of external-scripts
            require("../index")(robot);

            // create a user
            user = robot.brain.userForId("1", {
                name: "mocha",
                room: "#mocha"
            });

            adapter = robot.adapter;

            setTimeout(done, 250);
        });

        robot.run();
    });

    afterEach(function() {
        robot.shutdown();
    });

    /*
    * hubot what did i say
    */
    // Ask Hubot what you said, without saying anything to it previously
    //
    it("responds to what did i say without previous input", function(done) {
        var text = [randomWord(15),randomWord(12),randomWord(7)].join(' ');

        adapter.on("send", function(envelope, strings) {
            try { 
              expect(strings[0]).to.equal("I have no idea what you said");
              done();
            } catch(e) { 
              done(e);
            }
        });

      adapter.receive(new TextMessage(user, robot.name+" what did i say"));
    });

    // Ask Hubot what you said, after saying something in the room
    //
    it("responds to what did i say with correct output", function(done) {
        var text = [randomWord(15),randomWord(12),randomWord(7)].join(' ');

        adapter.on("send", function(envelope, strings) {
            try { 
              expect(strings[0]).to.equal("You said: "+text);
              done();
            } catch(e) { 
              done(e);
            }
        });

      adapter.receive(new TextMessage(user, text)); 
      adapter.receive(new TextMessage(user, robot.name+" what did i say"));
    });

    /*
    * s/find/replace/modifier
    */
    // substitute beer for stout beer
    //
    it("s/beer/stout beer", function(done) {
        var text = [randomWord(15),randomWord(12),randomWord(7)].join(' ');

        adapter.on("send", function(envelope, strings) {
            try { 
              expect(strings[0]).to.equal(user.name+": I could really go for a stout beer right now");
              done();
            } catch(e) { 
              done(e);
            }
        });

      adapter.receive(new TextMessage(user, "I could really go for a beer right now"));
      adapter.receive(new TextMessage(user, "s/beer/stout beer"));
    });

    // substitute their for their with a trailing forwardslash
    //
    it("s/their/there/", function(done) {
        var text = [randomWord(15),randomWord(12),randomWord(7)].join(' ');

        adapter.on("send", function(envelope, strings) {
            try { 
              expect(strings[0]).to.equal(user.name+": I can't wait until we get there");
              done();
            } catch(e) { 
              done(e);
            }
        });

      adapter.receive(new TextMessage(user, "I can't wait until we get their")); 
      adapter.receive(new TextMessage(user, "s/their/there/"));
    });

    // substitute woof for moo globally
    //
    it("s/woof/moo/g", function(done) {
        var text = [randomWord(15),randomWord(12),randomWord(7)].join(' ');

        adapter.on("send", function(envelope, strings) {
            try { 
              expect(strings[0]).to.equal(user.name+": The cow goes moo moo");
              done();
            } catch(e) { 
              done(e);
            }
        });

      adapter.receive(new TextMessage(user, "The cow goes woof woof")); 
      adapter.receive(new TextMessage(user, "s/woof/moo/g"));
    });
});

function randomWord(length) { 
  length = length || 5;

  var text = "";
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < length; i++ ) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}
