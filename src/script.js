let isRoot = false;
let users = { 'user': '12345' };
let currentUser = 'user';
let currentDir = '~';
let authenticated = false;
let promptElement = document.getElementById('prompt');
let outputElement = document.getElementById('output');
let inputElement = document.getElementById('input');

const directories = {
    '~': ['bin', 'boot', 'dev', 'etc', 'home', 'lib', 'lib64', 'media', 'mnt', 'opt', 'proc', 'root', 'run', 'sbin', 'srv', 'sys', 'tmp', 'usr', 'var'],
};

function updatePrompt() {
    if (isRoot) {
        promptElement.textContent = `root@electron:${currentDir}# `;
        promptElement.style.color = 'red';
    } else {
        promptElement.textContent = `${currentUser}@electron:${currentDir}$ `;
        promptElement.style.color = 'cyan';
    }
}

async function executeCommand(command) {
    let output = '';
    let args = command.split(' ');
    let cmd = args[0];

    switch (cmd) {
        case 'sudo':
            if (args[1] === 'su') {
                let password = prompt("Enter password for sudo: ");
                if (password === '12345') {
                    isRoot = true;
                    authenticated = true;
                    currentUser = 'root';
                } else {
                    output = 'Authentication failure. Hint: 12345';
                }
            } else if ((args[1] === 'apt' && args[2] === 'update') || (args[1] === 'update')) {
                if (authenticated) {
                    output = 'Updating package lists...\n[=========>.........] 50%\nUpdating package lists... Done.';
                } else {
                    output = 'This command requires root privileges.';
                }
            } else if ((args[1] === 'apt' && args[2] === 'upgrade') || (args[1] === 'upgrade')) {
                if (authenticated) {
                    if (args.includes('-y')) {
                        output = 'Upgrading packages...\n[====================] 100%\nUpgrading packages... Done.';
                    } else {
                        let confirm = prompt("Do you want to continue? [Y/n]");
                        if (confirm.toLowerCase() === 'y') {
                            output = 'Upgrading packages...\n[====================] 100%\nUpgrading packages... Done.';
                        } else {
                            output = 'Operation cancelled.';
                        }
                    }
                } else {
                    output = 'This command requires root privileges.';
                }
            } else {
                output = `Command not found: ${command}`;
            }
            break;
        case 'ls':
            output = directories[currentDir].join(' ');
            break;
        case 'cd':
            if (args[1]) {
                if (args[1] === '..') {
                    currentDir = currentDir.split('/').slice(0, -1).join('/') || '~';
                } else if (directories[currentDir] && directories[currentDir].includes(args[1])) {
                    currentDir = args[1];
                } else {
                    output = `bash: cd: ${args[1]}: No such file or directory`;
                }
            } else {
                currentDir = '~';
            }
            break;
        case 'pwd':
            output = currentDir;
            break;
        case 'whoami':
            output = currentUser;
            break;
        case 'uname':
            if (args[1] === '-a') {
                output = 'Electron v1.1.2 by Hrishav';
            } else {
                output = 'Usage: uname -a';
            }
            break;
        case 'python':
            if (args[1] === '--version') {
                output = 'Python 3.8.5';
            } else {
                output = 'Usage: python --version';
            }
            break;
        case 'adduser':
            if (args[1]) {
                let newUser = args[1];
                let password1 = prompt(`Set a new password: `);
                let password2 = prompt(`Enter the password again: `);
                if (password1 === password2) {
                    users[newUser] = password1;
                    output = `Added user ${newUser}.`;
                } else {
                    output = `Passwords do not match. Try again.`;
                }
            } else {
                output = 'Usage: adduser <username>';
            }
            break;
        case 'login':
            if (args[1]) {
                let user = args[1];
                let password = prompt(`Password: `);
                if (users[user] && users[user] === password) {
                    currentUser = user;
                    output = `Logged in as ${user}`;
                } else {
                    output = 'Login incorrect';
                }
            } else {
                output = 'Usage: login <username>';
            }
            break;
        case 'exit':
            if (isRoot) {
                isRoot = false;
                authenticated = false;
                currentUser = 'user';
            } else {
                output = 'No more processes left to exit.';
            }
            break;
        case 'clear':
            outputElement.innerHTML = '';
            return '';
        case 'ifconfig':
            output = `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
    inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
    inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>
    ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)
    RX packets 215265  bytes 327264500 (312.1 MiB)
    RX errors 0  dropped 0  overruns 0  frame 0
    TX packets 155209  bytes 14030524 (13.3 MiB)
    TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
    inet 127.0.0.1  netmask 255.0.0.0
    inet6 ::1  prefixlen 128  scopeid 0x10<host>
    loop  txqueuelen 1000  (Local Loopback)
    RX packets 0  bytes 0 (0.0 B)
    RX errors 0  dropped 0  overruns 0  frame 0
    TX packets 0  bytes 0 (0.0 B)
    TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0`;
            break;
        case 'trace':
            if (args[1] === '-m') {
                output = await fetchIpInfo();
            } else if (args[1] === '-t' && args[2]) {
                const targetIp = args[2];
                output = await fetchIpInfo(targetIp);
            } else {
                output = 'Usage: trace -m | trace -t <IP address>';
            }
            break;
        default:
            output = `Command not found: ${command}`;
    }
    return output;
}

async function fetchIpInfo(ip = '') {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    const { ip: ipAddress, city, region, country_name, timezone, org, asn, latitude, longitude, utc_offset } = data;
    const localTime = new Date().toLocaleString('en-US', { timeZone: timezone });

    return `IP: ${ipAddress}
City: ${city}
Region: ${region}
Country: ${country_name}
Timezone: ${timezone}
Local Time: ${localTime}
ISP: ${org}
ASN: ${asn}
Latitude: ${latitude}
Longitude: ${longitude}`;
}

inputElement.addEventListener('keydown', async function (event) {
    if (event.key === 'Enter') {
        let command = inputElement.value;
        let output = await executeCommand(command);
        if (output) {
            outputElement.innerHTML += `<div><span style="color:${promptElement.style.color};">${promptElement.textContent}</span> ${command}</div><div style="color:lime; text-align:left;">${output}</div>`;
        } else {
            outputElement.innerHTML += `<div><span style="color:${promptElement.style.color};">${promptElement.textContent}</span> ${command}</div>`;
        }
        inputElement.value = '';
        updatePrompt();
        outputElement.scrollTop = outputElement.scrollHeight;
    }
});

updatePrompt();
