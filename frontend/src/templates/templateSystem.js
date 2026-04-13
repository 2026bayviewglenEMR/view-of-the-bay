export function getTemplates() {
  return [
    {
      name: "Contact request",
      description: "A simple contact form to gather name, email, and a message.",
      submitLabel: "Send request",
      fields: [
        {
          label: "Full name",
          model: "fullName",
          type: "text",
          placeholder: "Jane Doe",
        },
        {
          label: "Email address",
          model: "email",
          type: "text",
          placeholder: "you@example.com",
        },
        {
          label: "Message",
          model: "message",
          type: "textarea",
          placeholder: "Write your message...",
        },
        {
          label: "Subscribe to newsletter",
          model: "subscribe",
          type: "checkbox",
          default: true,
        },
      ],
    },
    {
      name: "Event RSVP",
      description: "RSVP for an upcoming event with attendee details and preferences.",
      submitLabel: "RSVP",
      fields: [
        {
          label: "Attendee name",
          model: "attendee",
          type: "text",
          placeholder: "Your name",
        },
        {
          label: "Email",
          model: "email",
          type: "text",
          placeholder: "your@email.com",
        },
        {
          label: "Notes",
          model: "notes",
          type: "textarea",
          placeholder: "Any special requests?",
        },
        {
          label: "Will you attend?",
          model: "attending",
          type: "checkbox",
          default: false,
        },
      ],
    },
  ];
}

export function getTemplateByName(name) {
  return getTemplates().find((template) => template.name === name) || null;
}
