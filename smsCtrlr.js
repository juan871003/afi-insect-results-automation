const AWS = require('aws-sdk');
const credentials = require('./credentials');
const params = {};
let initialised = false;

const smsCtrlr = {
  sendMessage: async function (message, environment) {
    if(!initialised) { initialise(environment); }
    params.Message = message;
    const publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
    publishTextPromise
      .then(
        function (data) {
          console.log("Message sent:", message);
          console.log("MessageID is " + data.MessageId);
        }
      ).catch(
        function (err) {
          console.error(err, err.stack);
        }
      );
  }
}

function initialise(environment) {
  AWS.config.update({ region: 'ap-southeast-2' });
  params.TopicArn = 
    environment === 'production' ? 
    credentials.snsProdTopicArn :
    credentials.snsDevTopicArn;
  initialised = true;
}

module.exports = smsCtrlr;
