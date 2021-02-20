package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

func setupResponse(w *http.ResponseWriter, req *http.Request) {
	(*w).Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

var messageChan chan Message

func handler(w http.ResponseWriter, r *http.Request) {
	setupResponse(&w, r)
	switch r.Method {
	case "GET":
		handleSSE(w, r)
	case "POST":
		sendMessage(w, r)
	default:
		fmt.Fprintf(w, "Sorry, only GET and POST methods are supported.")
	}
}

func handleSSE(w http.ResponseWriter, r *http.Request) {

	log.Printf("Get handshake from client")

	// prepare the header
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// instantiate the channel
	messageChan = make(chan Message)

	// close the channel after exit the function
	defer func() {
		close(messageChan)
		messageChan = nil
		log.Printf("client connection is closed")
	}()

	// prepare the flusher
	flusher, _ := w.(http.Flusher)

	// trap the request under loop forever
	for {

		select {

		// message will received here and printed
		case message := <-messageChan:
			fmt.Fprintf(w, "event: message data: %+v\n", message)
			flusher.Flush()

		// connection is closed then defer will be executed
		case <-r.Context().Done():
			return

		}
	}
}

type Message struct {
	User    string `json:"user"`
	Message string `json:"message"`
}

func sendMessage(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		fmt.Printf("body error")
	}

	var m Message
	err = json.Unmarshal(body, &m)
	if err != nil {
		fmt.Printf("unmarshal error")
	}

	if messageChan != nil {
		log.Printf("print message to client")

		// send the message through the available channel
		messageChan <- m
	}
}

func main() {
	http.HandleFunc("/message", handler)

	log.Fatal("HTTP server error: ", http.ListenAndServe("localhost:5000", nil))
}
