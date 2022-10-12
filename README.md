# Firecove
### **[Cloudflare Tunnels](https://blog.cloudflare.com/tunnel-for-everyone/) may be a better solution than this, as it creates an outgoing connection only tunnel to Cloudflare, effectively making it that you no longer have to punch holes in your firewall for Cloudflare to connect.**

Configure OVH firewall to automatically only allow traffic from Cloudflare ranges. This script does not completely remove the risk of DDoS attacks. It just makes it much easier to do so, using Cloudflare's suite of security tools.

WARNING: Ensure you configure all your software firewall rules on the OVH website, else you will be unable to access your other services in accordance with your current software firewall rules. **Do not deploy to production without testing, unless you know what you're doing**. I'm not responsible for any downtime you may experience as a result of this script.

WARNING: This script gives Cloudflare IP ranges access to **any** port on your origin server. The intention of this script is to ensure all traffic is either scrubbed by OVH's hardware firewall, or goes through Cloudflare's network, to allow easy mitigation of DDoS attacks. If you want to restrict the ports Cloudflare can reach, you must configure your software firewall to do so.

WARNING: This script is meant to be used in conjunction with software, such as [cloudflare-ufw](https://github.com/Paul-Reed/cloudflare-ufw). If you do not configure a software firewall, any attacker with an OVH hosted server will still be able to send requests to your origin server.

WARNING: **This script will stop UDP connections from working on your server, unless you add additional firewall rules to allow them. Services such as NTP and DNS will not work. As an alternative, you can configure these services to use servers inside OVH's network.**

## How to use
1. Clone this repository.
2. Navigate to the directory of the cloned repository.
3. Ensure node.js is installed, and execute `npm install` in your terminal.
4. Check your current software firewall for any rules that must be mirrored to OVH's firewall settings.
5. Copy `config.json.example` to `config.json`.
6. Generate OVH API credentials from one of the below links, and place it into the respective areas of the config.json.
7. Place your IP address subnets + IP addresses into the respective areas of the config.json.
8. Create an OVH firewall for every IP you are securing.
9. Run the script (and optionally, add it to crontab to run at least weekly, but no more than once per hour)
10. Mirror any necessary firewall changes, and enable the OVH firewall for every IP you have secured on the configuration.

## OVH Endpoints
Depending on which OVH region you use, you will have to use one of the following URLs, and set the endpoint configuration option to one of these values. This script is not compatible with Kimsufi, or SoYouStart servers.


[OVH Europe](https://eu.api.ovh.com/createToken/?GET=%2Fip%2F%2A%2Ffirewall%2F%2A%2Frule&GET=%2Fip%2F%2A%2Ffirewall%2F%2A%2Frule%2F%2A&POST=%2Fip%2F%2A%2Ffirewall%2F%2A%2Frule&DELETE=%2Fip%2F%2A%2Ffirewall%2F%2A%2Frule%2F%2A): `ovh-eu`

[OVH US](https://api.us.ovhcloud.com/createToken/?GET=%2Fip%2F%2A%2Ffirewall%2F%2A%2Frule&GET=%2Fip%2F%2A%2Ffirewall%2F%2A%2Frule%2F%2A&POST=%2Fip%2F%2A%2Ffirewall%2F%2A%2Frule&DELETE=%2Fip%2F%2A%2Ffirewall%2F%2A%2Frule%2F%2A): `ovh-us`

[OVH North-America](https://ca.api.ovh.com/createToken/?GET=%2Fip%2F%2A%2Ffirewall%2F%2A%2Frule&GET=%2Fip%2F%2A%2Ffirewall%2F%2A%2Frule%2F%2A&POST=%2Fip%2F%2A%2Ffirewall%2F%2A%2Frule&DELETE=%2Fip%2F%2A%2Ffirewall%2F%2A%2Frule%2F%2A): `ovh-ca`

## Contact
You can contact me via email at mem[at]mem[dot]rip. Support is not guaranteed.
