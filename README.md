# Electron
A Toy Linux Terminal written in JavaScript.

# Overview
Electron is a toy terminal emulator designed to simulate a Debian-based Linux environment. It supports basic commands typically found in such systems, allowing users to practice and familiarize themselves with terminal operations in a controlled, browser-based environment.

![image](https://github.com/Hrishavvv/Electron/assets/114722342/51493069-5fb7-458d-9220-1b1760354608)

# Features
**User Management:** Add and switch between multiple local users.

**System Update and Upgrade:** Simulate the update and upgrade of repositories and packages.

**File System Navigation:** Navigate through directories, list storage contents, and print the working directory.

**System Information:** Display basic system information like the distro version.

# Supported Commands
`sudo su`: Access the root user.

`sudo apt update`: Update the repository index.

`sudo apt upgrade / sudo apt upgrade -y`: Upgrade installed packages.

`cd <directory>`: Change the current directory.

`ls`: List the contents of the current directory.

`pwd`: Print the current working directory.

`adduser <username>`: Add a new local user.

`login <username>`: Log into an existing local user.

`whoami`: Print the current username.

`exit`: Exit the root user session.

`uname -a`: Display the current version of the distribution.

`ifconfig`: Display the infromation about your network.

`trace -m`: Get infromation about your own IP Address.

`trace -t <ip addr>`: Get infromation about the entered IP Address.

# v1.1.3 beta Update

`mkdir <directory>`: Create a new directory.

`rmdir <directory>`: Remove an empty directory.

`rm <file>`: Remove a file.

`rm -rf <directory>`: Remove a directory and its contents recursively.

`nano <filename>`: Create or edit a file.

`cat <filename>`: Display the content of a file.

**Accessing or modifying root directories is prohibited**

_More commands will be added soon..._

# Issues & Fixes ⚒
**ls: cannot access 'undefined': No such file or directory**
This issue may arise if the cached data interferes with the new implementation of LocalStorage to store data locally in the browser.
**Fix** : Clearing cookies and site data can fix this issue

_This issue will be fixed in the next update 🚀_
