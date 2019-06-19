const AWS = require('aws-sdk');
const params = {};
let initialised = false;

const smsCtrlr = {
  sendMessage: async function (message) {
    if(!initialised) { initialise(); }
    params.Message = message;
    const publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
    publishTextPromise
      .then(
        function (data) {
          console.log("Message ${params.Message} send sent to the topic ${params.TopicArn}");
          console.log("MessageID is " + data.MessageId);
        }
      ).catch(
        function (err) {
          console.error(err, err.stack);
        }
      );
  }
}

function initialise() {
  AWS.config.update({ region: 'ap-southeast-2' });
  params.TopicArn = 'arn:aws:sns:ap-southeast-2:700761671561:Insects';
  //params.TopicArn = 'arn:aws:sns:ap-southeast-2:700761671561:NotifyMe';
  initialised = true;
}

module.exports = smsCtrlr;
