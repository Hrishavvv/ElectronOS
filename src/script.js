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

let pingInterval;
let isPinging = false;

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
            output = `
eth0      Link encap:Ethernet  HWaddr 00:0a:95:9d:68:16  
          inet addr:192.168.1.2  Bcast:192.168.1.255  Mask:255.255.255.0
          inet6 addr: fe80::20a:95ff:fe9d:6816/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:123456 errors:0 dropped:0 overruns:0 frame:0
          TX packets:123456 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000 
          RX bytes:1048576 (1.0 MB)  TX bytes:1048576 (1.0 MB)

lo        Link encap:Local Loopback  
          inet addr:127.0.0.1  Mask:255.0.0.0
          inet6 addr: ::1/128 Scope:Host
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:1234 errors:0 dropped:0 overruns:0 frame:0
          TX packets:1234 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000 
          RX bytes:98765 (98.7 KB)  TX bytes:98765 (98.7 KB)
            `;
            break;
         case 'ping':
            if (args[1]) {
                const target = args[1];
                let count = 0;
                outputElement.innerHTML += `<div><span style="color:${promptElement.style.color};">${promptElement.textContent}</span> ${command}</div>`;
                isPinging = true;
                pingInterval = setInterval(async () => {
                    if (!isPinging) {
                        clearInterval(pingInterval);
                        return;
                    }
                    count++;
                    try {
                        const response = await fetch(`https://api.ping.pe/?host=${target}`);
                        const data = await response.json();
                        const time = data.rtt.toFixed(2);
                        outputElement.innerHTML += `<div style="color:lime;">64 bytes from ${target}: icmp_seq=${count} ttl=64 time=${time} ms</div>`;
                    } catch (error) {
                        outputElement.innerHTML += `<div style="color:lime;">PING ${target} (${target}): Network is unreachable</div>`;
                    }
                    outputElement.scrollTop = outputElement.scrollHeight;
                }, 1000);
                return '';
            } else {
                output = 'Usage: ping <hostname or IP address>';
            }
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

    return `
<div style="color:lime;">
    IP Address: ${ipAddress}
    Location: ${city}, ${region}, ${country_name}
    Timezone: ${timezone} (UTC${utc_offset})
    Local Time: ${localTime}
    ISP: ${org}
    ASN: ${asn}
    Lat/Long: ${latitude}, ${longitude}
</div>
    `;
}

inputElement.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        let command = inputElement.value;
        outputElement.innerHTML += `<div><span style="color:${promptElement.style.color};">${promptElement.textContent}</span> ${command}</div>`;
        executeCommand(command).then(output => {
            if (output) {
                outputElement.innerHTML += `<div style="color:lime;">${output}</div>`;
                outputElement.scrollTop = outputElement.scrollHeight;
            }
            inputElement.value = '';
        });
    } else if (event.key === 'c' && event.ctrlKey && isPinging) {
        isPinging = false;
        clearInterval(pingInterval);
        outputElement.innerHTML += `<div style="color:lime;">--- ping statistics ---</div>`;
        inputElement.value = '';
    }
});

updatePrompt();
