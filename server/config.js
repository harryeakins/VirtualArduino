var config = {}

config.web = {};
config.docker = {};
config.db = {};
config.test = {};

config.web.title = "Virtual Arduino - Alpha!";
config.web.port = 80;
config.web.hostname = "virtualarduino.harryeakins.com";

config.use_docker = true;
config.docker.memory_limit = "50m";

config.db.location = "var/db";

config.test.chrome_driver_host = "localhost";
config.test.chrome_driver_port = 9515;

module.exports = config;
