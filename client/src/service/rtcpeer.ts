class PeerService {

  peer: RTCPeerConnection | null;

  constructor() {
    this.peer = null; 
    this.setupConnection(); 
  }

  setupConnection(): void {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
            ],
          },
        ],
      });
      console.log("Connection set up");
    }
  }

 async getOffer(): Promise<RTCSessionDescriptionInit | void> {
    try {
      if (this.peer) {
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(new RTCSessionDescription(offer));
        return offer; 
      }
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }

  async getAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | void> {
    try {
      if (this.peer) {
        await this.setRemote(offer);
        const ans = await this.peer.createAnswer();
        await this.peer.setLocalDescription(new RTCSessionDescription(ans));
        return ans; 
      }
    } catch (error) {
      console.error("Error creating answer:", error);
    }
  }

  async setRemote(ans: RTCSessionDescriptionInit): Promise<void> {
    try {
      if (this.peer) {
        await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
      }
    } catch (error) {
      console.error("Error setting remote description:", error);
    }
  }


}

export default new PeerService();
