class apiResponse {
    constructor(statuscode,message="success",data){
        this.statuscode=statuscode;
        this.message=message;
        this.success=true;
        this.data=data;
    }
}
export {apiResponse}