## 1. Long Coding Problem — 50 Minutes

### **Build an AI Interview Assistant**

### Interview Scenario

You are building a small **AI Interview Assistant** for students preparing for technical interviews.

The application should allow a student to enter a topic and generate a set of interview questions using an LLM API.

The UI should provide:

* A topic input
* A **Generate Questions** button
* A container to display the generated questions
* A loading state while the API is responding
* An error message if the request fails

The focus is on **prompt construction + API integration + handling an LLM response**, rather than building a complete AI product.

---

### Requirements

#### 1. Create the Input UI

The page should contain:

```text
Topic: [________________]
Difficulty: [Medium ▼]

[ Generate Questions ]
```

The student should dynamically handle the user's input using JavaScript.

If the topic is empty, don't make an API request. Show an appropriate validation message.

---

#### 2. Create a Structured Prompt

When the user clicks **Generate Questions**, construct a prompt that clearly instructs the LLM to:

* Act as a technical interviewer.
* Generate **5 interview questions**.
* Use the selected topic.
* Follow the selected difficulty.
* Include a mixture of conceptual and practical questions.
* Return the response in a structured JSON format.

For example, the expected structure should be conceptually similar to:

```json id="x8q8l2"
{
  "questions": [
    {
      "question": "What is a closure in JavaScript?",
      "type": "conceptual"
    },
    {
      "question": "Debug the following code...",
      "type": "practical"
    }
  ]
}
```

The prompt should be constructed dynamically rather than hardcoded for one particular topic.

---

#### 3. Make the LLM API Request

Use an LLM API of the provider demonstrated in class.

The request should:

* Use authentication securely.
* Send the appropriate role-based messages.
* Include the dynamically generated prompt.
* Handle the API response asynchronously.

The student should **not expose the API key directly in frontend/client-side code**.

---

#### 4. Handle the Response

After receiving the response:

* Parse the returned JSON/data.
* Extract the questions.
* Dynamically create question cards.
* Display the question and its type.

Example:

```text id="q2t6y8"
Question 1

What is a closure in JavaScript?

Type: Conceptual
```

---

#### 5. Loading State

While waiting for the API response:

* Disable the **Generate Questions** button.
* Display:

```text
Generating interview questions...
```

Once the response arrives, restore the button and remove the loading message.

---

#### 6. Error Handling

Handle cases such as:

* Empty topic
* Failed API request
* Invalid API response
* Rate-limit/API error

Display a meaningful message instead of leaving the interface blank.

---

### Bonus — Only if Time Permits

Add a **"Generate Another Set"** button after questions are generated.

The user should be able to generate another set without refreshing the page.

**Optional advanced bonus:** If the API supports streaming, display the response progressively instead of waiting for the entire response.

---

### Expected Concepts

The student should naturally demonstrate:

* LLM fundamentals at a high level
* Prompt structure
* Role-based prompting
* Zero-shot/few-shot concepts
* Structured output prompting
* API authentication
* Chat-based API requests
* Asynchronous API calls
* JSON parsing
* Error handling
* Rate-limit handling
* Dynamic DOM manipulation
* Loading states

---