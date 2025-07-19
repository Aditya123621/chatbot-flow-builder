# Chatbot Flow Builder – BiteSpeed Task

This is a simple **chatbot flow builder** made using **Next.js**, **React Flow**, **Tailwind CSS**, and **react-hot-toast**.

It lets you create a chatbot message flow by adding and connecting message nodes. Each message can be edited from the settings panel.

---

## 🧩 Features

### ✅ Message Node (Text)

- You can drag and drop as many **message nodes** as you want.
- Each node shows a message and a WhatsApp icon.
- You can click a node to edit its message.

### ✅ Flow Builder with React Flow

- Uses [React Flow](https://reactflow.dev/) to create the flow.
- Nodes can be connected using edges.
- A node can have **only one outgoing edge**.
- A node can have **multiple incoming edges**.

### ✅ Settings Panel

- When a node is selected, you can edit the message in the right panel.
- It uses **debounce** (from lodash) to avoid updating too fast.

### ✅ Nodes Panel

- When no node is selected, the panel on the right lets you **drag and drop** new message nodes.
- This is built in a way to support **adding more types of nodes later**.

### ✅ Save Flow

- There is a "Save changes" button at the top.
- When clicked:
  - If there are more than one nodes, and more than one of them have **no incoming connection**, it shows an error.
  - Otherwise, it shows a success toast.

---

## 🛠 Tech Stack

- **Next.js (App Router)**
- **React Flow**
- **Tailwind CSS**
- **Lodash** (for debounce)
- **react-hot-toast** (for toast messages)

---

## 🚀 How to Run

1. **Clone the repo**

   ```bash
   git clone git@github.com:Aditya123621/chatbot-flow-builder.git
   cd chatbot-flow-builder

   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
