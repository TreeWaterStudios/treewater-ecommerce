/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const name = e.record.get("name");
  const email = e.record.get("email");
  const message = e.record.get("message");
  const submissionDate = e.record.get("submissionDate");

  const message_obj = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName
    },
    to: [{ address: "admin@treewater.com" }],
    subject: "New Contact Form Submission from " + name,
    html: "<h2>New Contact Form Submission</h2>" +
          "<p><strong>Name:</strong> " + name + "</p>" +
          "<p><strong>Email:</strong> " + email + "</p>" +
          "<p><strong>Message:</strong></p>" +
          "<p>" + message + "</p>" +
          "<p><strong>Submitted:</strong> " + submissionDate + "</p>"
  });
  $app.newMailClient().send(message_obj);
  e.next();
}, "contact_submissions");