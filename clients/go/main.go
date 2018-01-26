package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"errors"
	"fmt"
)

type Order struct {
	Prices     []float32
	Quantities []int
	Country    string
	Reduction  string
}

type Reply struct {
	Total float32 `json:"total"`
}

func main() {
	http.HandleFunc("/order", handler)
	http.HandleFunc("/feedback", func(rw http.ResponseWriter, req *http.Request) {
		defer req.Body.Close()

		body, err := ioutil.ReadAll(req.Body)
		if err != nil {
			fmt.Printf("error reading body: %v\n", err)
			rw.WriteHeader(204)
			return
		}

		fmt.Printf("Feedback: %s\n", body)

		rw.WriteHeader(200)
	})

	err := http.ListenAndServe(fmt.Sprintf(":%s", getPort()), nil)
	if err != nil {
		log.Fatal("Listen and serve:", err)
	}
}

func handler(rw http.ResponseWriter, req *http.Request) {
	defer req.Body.Close()

	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		fmt.Printf("error reading body: %v\n", err)
		rw.WriteHeader(204)
		return
	}

	var order Order
	json.Unmarshal(body, &order)

	fmt.Printf("Got order: %#v\n", order)

	rw.Header().Add("Content-Type", "application/json")
	
	encoder := json.NewEncoder(rw)
	total, err := totalCost(order)
	if err != nil {
		rw.WriteHeader(400)
		return
	}

	total, err = taxReduction(total, order.Country)
	if err != nil {
		rw.WriteHeader(400)
		return
	}

	if order.Reduction == "STANDARD" {
		total = reduction(total)
	}

	rw.WriteHeader(200)
	encoder.Encode(Reply{float32(total)})
}

func totalCost(order Order) (float64, error) {
	sum := 0.0
	if len(order.Prices) == 0 || len(order.Prices) != len(order.Quantities) {
		return 0, errors.New("invalid")
	}
	for i, _ := range order.Prices {
		sum += float64(order.Prices[i] * float32(order.Quantities[i]))
	}

	return sum, nil
}

func taxReduction(total float64, country string) (float64, error) {
	c := 0
	c = countries()[country]
	if len(country) == 0 || c == 0 {
		return total, errors.New("invalid")
	}
	return total + total*(float64(countries()[country])/100), nil
}

func countries() map[string]int {
	return map[string]int{
		"DE": 20,
		"UK": 21,
		"FR": 20,
		"IT": 25,
		"ES": 19,
		"PL": 21,
		"RO": 20,
		"NL": 20,
		"BE": 24,
		"EL": 20,
		"CZ": 19,
		"PT": 23,
		"HU": 27,
		"SE": 23,
		"AT": 22,
		"BJ": 23,
		"DK": 21,
		"FI": 17,
		"SK": 18,
		"IE": 21,
		"HR": 23,
		"LT": 23,
		"SI": 24,
		"LV": 20,
		"EE": 22,
		"CY": 21,
		"LU": 25,
		"MT": 20,
	}
}

func getPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		return "9000"
	}
	return port
}

func reduction(total float64) float64 {
	reductNum := 0.0
	if total >= 50000 {
		reductNum = 0.15
	} else if total >= 10000 {
		reductNum = 0.1
	} else if total >= 7000 {
		reductNum = 0.07
	} else if total >= 5000 {
		reductNum = 0.05
	} else if total >= 1000 {
		reductNum = 0.03
	}
	return total - total*reductNum
}
