from fastapi.responses import JSONResponse

class Response:
    @staticmethod
    def success(data, message: str = "Request successful", status_code: int = 200):
        return JSONResponse(
            status_code=status_code,
            content={
                "status": "success",
                "message": message,
                "data": data,
            }
        )

    @staticmethod
    def failure(message: str, status_code: int = 400, error_details: str = None):
        return JSONResponse(
            status_code=status_code,
            content={"status": "failure", "message": message, "error_details": error_details}
        )