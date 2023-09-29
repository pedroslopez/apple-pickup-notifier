# apple-pickup-notifier

A simple node script to poll Apple Stores and check if a given item is available to order for in-store pickup. Useful when trying to get a new iPhone soon after launch date, when availability is limited.

It sends notifications using [Pushover](https://pushover.net/). You just need to install the Pushover app on your device to get notifications.

## Configuration

Copy the `.env.example` to `.env` to configure Pushover credentials.

```
cp .env.example .env
# open .env and configure as needed
```

Then, modify the `config.yml` to set the desired location, store, and parts you want to monitor.