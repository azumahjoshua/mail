document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);
  // console.log(cpf)
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#single-email-view').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}
function load_email(id) {
  //fecth a particular email
  fetch(`/emails/${id}`)
.then(response => response.json())
.then(email => {
    // Print email
  // console.log(email);
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'block';

  document.querySelector('#single-email-view').innerHTML = `
    <ul class="list-group">
  <li class="list-group-item"><strong>From:</strong>${email.sender}</li>
  <li class="list-group-item"><strong>To:</strong>${email.recipients}</li>
  <li class="list-group-item"> <strong>Subject:</strong>${email.subject}</li>
  <li class="list-group-item"><strong>Timestapm:</strong>${email.timestamp}</li>
  <li class="list-group-item">${email.body}</li>
</ul>
    `
  //change  to  read
  if (!email.read) {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })
  }
  // create reply button & append to DOMContentLoaded
  const btn_reply = document.createElement('button');
  btn_reply.innerHTML = 'Reply';
  btn_reply.className = "btn btn-info mt-2 mr-2"
  btn_reply.addEventListener('click', () => {
    compose_email()
    document.querySelector('#compose-recipients').value = email.sender;

    let subject = email.subject;
    if (subject.split(' ', 1)[0] != "Re:") {
      subject = "Re: "+ subject
    }
    document.querySelector('#compose-subject').value = subject;

    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:`;
  })
  document.querySelector('#single-email-view').append(btn_reply)
  // create archive button & append to DOM
  const btn_archived = document.createElement('button');
  btn_archived.innerHTML = email.archived ? "Unarchive" : "Archive";
  btn_archived.className = email.archived ? "btn btn-success mt-2 mr-2": "btn btn-danger mt-2 mr-2"
  btn_archived.addEventListener('click', ()=> {
  fetch(`/emails/${email.id}`, {
  method: 'PUT',
  body: JSON.stringify({
      archived: !email.archived
  })
  }).then(() => {
  load_mailbox('archive')
})
});
  document.querySelector('#single-email-view').append(btn_archived);
});
}
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach(email => {
        // console.log(email)
        const element = document.createElement('div');
        element.className = email['read'] ? "list-item-read" : "list-item-unread";
        element.innerHTML = `<span class="sender col-3"> <b>${email['sender']}</b> </span>
            <span class="subject col-6"> ${email['subject']} </span>
            <span class="timestamp col-3"> ${email['timestamp']} </span>`;
        element.addEventListener('click', () => {
          load_email(email['id'])
        })
        document.querySelector('#emails-view').append(element);
      })
    // console.log(emails)
  })
}
function send_email(event) {
  event.preventDefault();
  // event.stopImmediatePropagation();
  const recipients = document.querySelector('#compose-recipients').value
  const subject = document.querySelector('#compose-subject').value 
  const body = document.querySelector('#compose-body').value 
  document.querySelector('#single-email-view').style.display = 'none';
fetch('/emails', {
  method: 'POST',
  body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
  })
})
.then(response => response.json())
.then(result => {
    // Print result
  // console.log(result);
  load_mailbox('sent')
});
  // console.log("Hello")
  return false;
}



