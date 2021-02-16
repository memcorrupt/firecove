# Firecove
Configure OVH firewall to automatically only allow traffic from Cloudflare ranges. This script does not completely remove the risk of DDoS attacks. It just makes it much easier to do so, using Cloudflare's suite of security tools.

WARNING: Ensure you configure all your software firewall rules on the OVH website, else you will be unable to access your other services in accordance with your current software firewall rules. **Do not deploy to production without testing, unless you know what you're doing**. I'm not responsible for any downtime you may experience as a result of this script.

WARNING: This script gives Cloudflare IP ranges access to **any** port on your origin server. The intention of this script is to ensure all traffic is either scrubbed by OVH's hardware firewall, or goes through Cloudflare's network, to allow easy mitigation of DDoS attacks. If you want to restrict the ports Cloudflare can reach, you must configure your software firewall to do so.

WARNING: This script is meant to be used in conjunction with software, such as [cloudflare-ufw](https://github.com/Paul-Reed/cloudflare-ufw). If you do not configure a software firewall, any attacker with an OVH hosted server will still be able to send requests to your origin server.

## How to use
1. Clone this repository.
2. Navigate to the directory of the cloned repository.
3. Ensure node.js is installed, and execute `npm install` in your terminal.
4. Check your current software firewall for any rules that must be mirrored to OVH's firewall settings.
5. Configure the config.json file.
6. Create an OVH firewall for every IP you are securing.
7. Run the script (and optionally, add it to crontab to run at least weekly, but no more than once per hour)
8. Mirror any necessary firewall changes, and enable the OVH firewall for every IP you have secured on the configuration.

## Contact
You can contact me via email at mem[at]mem[dot]rip. Support is not guaranteed.